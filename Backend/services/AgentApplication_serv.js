const AgentApplication = require('../models/AgentApplication');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Agent Application Service
 * Handles delivery agent application submission, review, and approval workflow
 */
class AgentApplicationService {
  
  /**
   * Submit a new agent application
   */
  static async submitApplication(applicationData, submissionMeta = {}) {
    try {
      // Check if email already has an existing application
      const existingApplication = await AgentApplication.findOne({
        'personalInfo.email': applicationData.personalInfo.email.toLowerCase(),
        status: { $nin: ['rejected'] }
      });
      
      if (existingApplication) {
        throw {
          statusCode: 409,
          message: 'An application with this email already exists',
          applicationId: existingApplication.applicationId,
          status: existingApplication.status
        };
      }
      
      // Check if email already registered as a user
      const existingUser = await User.findOne({ 
        email: applicationData.personalInfo.email.toLowerCase() 
      });
      
      if (existingUser) {
        if (existingUser.role === 'shipping_agent') {
          throw {
            statusCode: 409,
            message: 'This email is already registered as a delivery agent'
          };
        }
      }
      
      // Validate age requirement (18+)
      const dob = new Date(applicationData.personalInfo.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 18) {
        throw {
          statusCode: 400,
          message: 'Applicants must be at least 18 years old'
        };
      }
      
      // Validate insurance validity
      const insuranceDate = new Date(applicationData.vehicleDetails.insuranceValidUntil);
      if (insuranceDate <= today) {
        throw {
          statusCode: 400,
          message: 'Vehicle insurance must be valid (not expired)'
        };
      }
      
      // Create the application
      const application = new AgentApplication({
        ...applicationData,
        termsAcceptedAt: applicationData.termsAccepted ? new Date() : null,
        submissionMeta: {
          ...submissionMeta,
          submittedAt: new Date()
        }
      });
      
      await application.save();
      
      return {
        success: true,
        message: 'Application submitted successfully',
        applicationId: application.applicationId,
        status: application.status
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Submit application error:', error);
      throw {
        statusCode: 500,
        message: 'Failed to submit application'
      };
    }
  }
  
  /**
   * Get application status by application ID or email
   */
  static async getApplicationStatus(identifier) {
    try {
      let application;
      
      // Check if identifier is an application ID or email
      if (identifier.startsWith('AGT')) {
        application = await AgentApplication.findOne({ applicationId: identifier });
      } else {
        application = await AgentApplication.findOne({ 
          'personalInfo.email': identifier.toLowerCase() 
        }).sort({ createdAt: -1 }); // Get most recent application
      }
      
      if (!application) {
        throw {
          statusCode: 404,
          message: 'Application not found'
        };
      }
      
      return {
        applicationId: application.applicationId,
        status: application.status,
        applicantName: application.personalInfo.fullName,
        submittedAt: application.submissionMeta.submittedAt,
        reviewedAt: application.review?.reviewedAt,
        rejectionReason: application.status === 'rejected' ? application.review?.rejectionReason : undefined,
        additionalInfoRequested: application.status === 'more_info_required' ? application.review?.additionalInfoRequested : undefined
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Get application status error:', error);
      throw {
        statusCode: 500,
        message: 'Failed to get application status'
      };
    }
  }
  
  /**
   * Get all applications (admin use)
   */
  static async getAllApplications(filters = {}, pagination = {}) {
    try {
      const { status, search, fromDate, toDate } = filters;
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      
      const query = {};
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (search) {
        query.$or = [
          { applicationId: { $regex: search, $options: 'i' } },
          { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
          { 'personalInfo.email': { $regex: search, $options: 'i' } },
          { 'personalInfo.phone': { $regex: search, $options: 'i' } }
        ];
      }
      
      if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
      }
      
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
      
      const [applications, total] = await Promise.all([
        AgentApplication.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .populate('review.reviewedBy', 'name email')
          .lean(),
        AgentApplication.countDocuments(query)
      ]);
      
      return {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get all applications error:', error);
      throw {
        statusCode: 500,
        message: 'Failed to fetch applications'
      };
    }
  }
  
  /**
   * Get single application details (admin use)
   */
  static async getApplicationById(applicationId) {
    try {
      const application = await AgentApplication.findOne({ applicationId })
        .populate('review.reviewedBy', 'name email')
        .populate('approvedUserId', 'name email role');
      
      if (!application) {
        throw {
          statusCode: 404,
          message: 'Application not found'
        };
      }
      
      return application;
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Get application by ID error:', error);
      throw {
        statusCode: 500,
        message: 'Failed to fetch application'
      };
    }
  }
  
  /**
   * Update application status to under_review
   */
  static async markUnderReview(applicationId, adminId) {
    try {
      const application = await AgentApplication.findOne({ applicationId });
      
      if (!application) {
        throw { statusCode: 404, message: 'Application not found' };
      }
      
      if (application.status !== 'pending') {
        throw { statusCode: 400, message: 'Only pending applications can be marked for review' };
      }
      
      application.status = 'under_review';
      application.review = {
        ...application.review,
        reviewedBy: adminId,
        reviewedAt: new Date()
      };
      
      await application.save();
      
      return { success: true, message: 'Application marked as under review' };
    } catch (error) {
      if (error.statusCode) throw error;
      throw { statusCode: 500, message: 'Failed to update application status' };
    }
  }
  
  /**
   * Request additional information from applicant
   */
  static async requestMoreInfo(applicationId, adminId, requestedInfo) {
    try {
      const application = await AgentApplication.findOne({ applicationId });
      
      if (!application) {
        throw { statusCode: 404, message: 'Application not found' };
      }
      
      if (!['pending', 'under_review'].includes(application.status)) {
        throw { statusCode: 400, message: 'Cannot request more info for this application status' };
      }
      
      application.status = 'more_info_required';
      application.review = {
        ...application.review,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        additionalInfoRequested: requestedInfo
      };
      
      await application.save();
      
      // TODO: Send email notification to applicant
      
      return { success: true, message: 'Additional information requested' };
    } catch (error) {
      if (error.statusCode) throw error;
      throw { statusCode: 500, message: 'Failed to request additional information' };
    }
  }
  
  /**
   * Approve an application and create agent user account
   */
  static async approveApplication(applicationId, adminId, notes = '') {
    try {
      const application = await AgentApplication.findOne({ applicationId });
      
      if (!application) {
        throw { statusCode: 404, message: 'Application not found' };
      }
      
      if (application.status === 'approved') {
        throw { statusCode: 400, message: 'Application is already approved' };
      }
      
      if (application.status === 'rejected') {
        throw { statusCode: 400, message: 'Cannot approve a rejected application' };
      }
      
      // Check if user with this email already exists
      let user = await User.findOne({ email: application.personalInfo.email.toLowerCase() });
      
      // Generate a random password for the new agent
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      
      if (user) {
        // Upgrade existing user to shipping_agent
        user.role = 'shipping_agent';
        user.agentProfile = {
          isActive: true,
          commissionRate: 5,
          baseDeliveryFee: 50,
          walletBalance: 0,
          totalEarnings: 0,
          totalDeliveries: 0,
          successfulDeliveries: 0,
          rating: 0,
          totalRatings: 0,
          serviceAreas: application.availability.preferredAreas.map(area => ({
            city: area.city,
            district: area.district,
            pinCodes: area.pinCodes
          })),
          vehicleType: application.vehicleDetails.vehicleType,
          vehicleNumber: application.vehicleDetails.vehicleRegistrationNumber,
          bankDetails: {
            accountHolder: application.bankDetails.accountHolderName,
            accountNumber: application.bankDetails.accountNumber,
            ifscCode: application.bankDetails.ifscCode,
            bankName: application.bankDetails.bankName
          }
        };
        await user.save();
      } else {
        // Create new user with shipping_agent role
        user = new User({
          name: application.personalInfo.fullName,
          email: application.personalInfo.email.toLowerCase(),
          phone: application.personalInfo.phone,
          password: hashedPassword,
          role: 'shipping_agent',
          isVerified: true,
          avatar: application.personalInfo.profilePhoto?.url,
          address: {
            street: application.personalInfo.address.street,
            city: application.personalInfo.address.city,
            state: application.personalInfo.address.state,
            pinCode: application.personalInfo.address.pinCode
          },
          agentProfile: {
            isActive: true,
            commissionRate: 5,
            baseDeliveryFee: 50,
            walletBalance: 0,
            totalEarnings: 0,
            totalDeliveries: 0,
            successfulDeliveries: 0,
            rating: 0,
            totalRatings: 0,
            serviceAreas: application.availability.preferredAreas.map(area => ({
              city: area.city,
              district: area.district,
              pinCodes: area.pinCodes
            })),
            vehicleType: application.vehicleDetails.vehicleType,
            vehicleNumber: application.vehicleDetails.vehicleRegistrationNumber,
            bankDetails: {
              accountHolder: application.bankDetails.accountHolderName,
              accountNumber: application.bankDetails.accountNumber,
              ifscCode: application.bankDetails.ifscCode,
              bankName: application.bankDetails.bankName
            }
          }
        });
        await user.save();
      }
      
      // Update application status
      application.status = 'approved';
      application.review = {
        reviewedBy: adminId,
        reviewedAt: new Date(),
        notes
      };
      application.approvedUserId = user._id;
      await application.save();
      
      // TODO: Send approval email with login credentials
      // For now, return the temp password (in production, only send via email)
      
      return {
        success: true,
        message: 'Application approved successfully',
        agentId: user._id,
        agentEmail: user.email,
        tempPassword: tempPassword // Remove in production - only send via email
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Approve application error:', error);
      throw { statusCode: 500, message: 'Failed to approve application' };
    }
  }
  
  /**
   * Reject an application
   */
  static async rejectApplication(applicationId, adminId, rejectionReason) {
    try {
      if (!rejectionReason || rejectionReason.trim().length < 10) {
        throw { statusCode: 400, message: 'Please provide a valid rejection reason (minimum 10 characters)' };
      }
      
      const application = await AgentApplication.findOne({ applicationId });
      
      if (!application) {
        throw { statusCode: 404, message: 'Application not found' };
      }
      
      if (application.status === 'approved') {
        throw { statusCode: 400, message: 'Cannot reject an approved application' };
      }
      
      if (application.status === 'rejected') {
        throw { statusCode: 400, message: 'Application is already rejected' };
      }
      
      application.status = 'rejected';
      application.review = {
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason
      };
      await application.save();
      
      // TODO: Send rejection email to applicant
      
      return {
        success: true,
        message: 'Application rejected'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Reject application error:', error);
      throw { statusCode: 500, message: 'Failed to reject application' };
    }
  }
  
  /**
   * Verify a document
   */
  static async verifyDocument(applicationId, documentType, adminId) {
    try {
      const validDocTypes = [
        'driverLicenseFront', 'driverLicenseBack', 
        'vehicleRegistrationCertificate', 'vehicleInsurance', 'addressProof'
      ];
      
      if (!validDocTypes.includes(documentType)) {
        throw { statusCode: 400, message: 'Invalid document type' };
      }
      
      const application = await AgentApplication.findOne({ applicationId });
      
      if (!application) {
        throw { statusCode: 404, message: 'Application not found' };
      }
      
      if (!application.documents[documentType]?.url) {
        throw { statusCode: 400, message: 'Document not uploaded' };
      }
      
      application.documents[documentType].verified = true;
      await application.save();
      
      return { success: true, message: `${documentType} verified successfully` };
    } catch (error) {
      if (error.statusCode) throw error;
      throw { statusCode: 500, message: 'Failed to verify document' };
    }
  }
  
  /**
   * Get application statistics (admin dashboard)
   */
  static async getApplicationStats() {
    try {
      const [statusCounts, recentApplications, monthlyStats] = await Promise.all([
        // Count by status
        AgentApplication.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        
        // Recent 5 applications
        AgentApplication.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('applicationId personalInfo.fullName status createdAt')
          .lean(),
        
        // Monthly application count (last 6 months)
        AgentApplication.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
      ]);
      
      const statusSummary = {
        pending: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        more_info_required: 0,
        total: 0
      };
      
      statusCounts.forEach(item => {
        statusSummary[item._id] = item.count;
        statusSummary.total += item.count;
      });
      
      return {
        statusSummary,
        recentApplications,
        monthlyStats
      };
    } catch (error) {
      console.error('Get application stats error:', error);
      throw { statusCode: 500, message: 'Failed to fetch application statistics' };
    }
  }
}

module.exports = AgentApplicationService;
