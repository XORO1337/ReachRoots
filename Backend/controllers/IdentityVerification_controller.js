const User = require('../models/User');
const aadhaarService = require('../services/aadhaarVerificationService');

class IdentityVerificationController {
  // Initiate Aadhaar verification by sending OTP
  static async initiateAadhaarVerification(req, res) {
    try {
      const { aadhaarNumber } = req.body;
      const userId = req.user.id;

      // Check if user is artisan or distributor
      if (!['artisan', 'distributor'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Identity verification is only required for artisans and distributors'
        });
      }

      // Validate Aadhaar format
      const validation = aadhaarService.validateAadhaarFormat(aadhaarNumber);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already verified
      if (user.isIdentityVerified && user.aadhaarVerification?.verificationStatus === 'verified') {
        return res.status(400).json({
          success: false,
          message: 'Identity is already verified'
        });
      }

      // Check rate limiting for verification attempts
      const now = new Date();
      const lastAttempt = user.aadhaarVerification?.lastAttemptAt;
      const attemptCount = user.aadhaarVerification?.verificationAttempts || 0;

      // Allow only 3 attempts per hour
      if (lastAttempt && (now - lastAttempt) < 60 * 60 * 1000 && attemptCount >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Too many verification attempts. Please try again after 1 hour.'
        });
      }

      // Check if same Aadhaar is already verified by another user
      const aadhaarHash = aadhaarService.hashAadhaarNumber(validation.cleanAadhaar);
      const existingUser = await User.findOne({
        'aadhaarVerification.aadhaarHash': aadhaarHash,
        'aadhaarVerification.verificationStatus': 'verified',
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This Aadhaar number is already verified with another account'
        });
      }

      // Send OTP to Aadhaar linked mobile
      const otpResult = await aadhaarService.sendAadhaarOTP(validation.cleanAadhaar);

      if (!otpResult.success) {
        return res.status(400).json({
          success: false,
          message: otpResult.message
        });
      }

      // Update user with verification attempt
      const updateData = {
        'aadhaarVerification.aadhaarHash': aadhaarHash,
        'aadhaarVerification.maskedAadhaar': aadhaarService.maskAadhaarNumber(validation.cleanAadhaar),
        'aadhaarVerification.transactionId': otpResult.transactionId,
        'aadhaarVerification.verificationStatus': 'pending',
        'aadhaarVerification.lastAttemptAt': now,
        'aadhaarVerification.verificationAttempts': (attemptCount + 1)
      };

      await User.findByIdAndUpdate(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your Aadhaar registered mobile number',
        data: {
          transactionId: otpResult.transactionId,
          maskedAadhaar: aadhaarService.maskAadhaarNumber(validation.cleanAadhaar),
          ...(process.env.NODE_ENV === 'development' && otpResult.mockOtp && {
            mockOtp: otpResult.mockOtp
          })
        }
      });

    } catch (error) {
      console.error('Aadhaar verification initiation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate Aadhaar verification. Please try again later.'
      });
    }
  }

  // Verify OTP and complete Aadhaar verification
  static async verifyAadhaarOTP(req, res) {
    try {
      const { otp } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if verification is in progress
      if (!user.aadhaarVerification?.transactionId) {
        return res.status(400).json({
          success: false,
          message: 'No Aadhaar verification in progress. Please initiate verification first.'
        });
      }

      // Verify OTP with Aadhaar service
      const verificationResult = await aadhaarService.verifyAadhaarOTP(
        user.aadhaarVerification.transactionId,
        otp
      );

      if (!verificationResult.success || !verificationResult.verified) {
        return res.status(400).json({
          success: false,
          message: verificationResult.message || 'OTP verification failed'
        });
      }

      // Update user with verified Aadhaar data
      const updateData = {
        'aadhaarVerification.verificationStatus': 'verified',
        'aadhaarVerification.verifiedAt': new Date(),
        'aadhaarVerification.aadhaarData': verificationResult.aadhaarData,
        'isIdentityVerified': true,
        '$unset': {
          'aadhaarVerification.transactionId': 1
        }
      };

      await User.findByIdAndUpdate(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Aadhaar verification completed successfully',
        data: {
          isIdentityVerified: true,
          verifiedAt: new Date(),
          aadhaarData: {
            name: verificationResult.aadhaarData.name,
            dateOfBirth: verificationResult.aadhaarData.dateOfBirth,
            gender: verificationResult.aadhaarData.gender,
            // Only include address if needed
            address: verificationResult.aadhaarData.address
          }
        }
      });

    } catch (error) {
      console.error('Aadhaar OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP. Please try again later.'
      });
    }
  }

  // Get verification status
  static async getVerificationStatus(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('aadhaarVerification isIdentityVerified role verificationDocuments');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if verification is required for this role
      const requiresVerification = ['artisan', 'distributor'].includes(user.role);

      if (!requiresVerification) {
        return res.json({
          success: true,
          message: 'Verification status retrieved successfully',
          data: {
            requiresVerification: false,
            isVerified: true,
            status: 'not_required'
          }
        });
      }

      // Check Aadhaar verification status
      const aadhaarVerification = user.aadhaarVerification;
      let verificationData = {
        requiresVerification: true,
        isVerified: user.isIdentityVerified,
        verificationType: 'aadhaar',
        status: aadhaarVerification?.verificationStatus || 'not_started'
      };

      if (aadhaarVerification) {
        verificationData = {
          ...verificationData,
          maskedAadhaar: aadhaarVerification.maskedAadhaar,
          verifiedAt: aadhaarVerification.verifiedAt,
          canSellProducts: user.isIdentityVerified,
          verificationAttempts: aadhaarVerification.verificationAttempts || 0,
          lastAttemptAt: aadhaarVerification.lastAttemptAt
        };

        // If verification is completed, include Aadhaar data
        if (aadhaarVerification.verificationStatus === 'verified' && aadhaarVerification.aadhaarData) {
          verificationData.aadhaarData = {
            name: aadhaarVerification.aadhaarData.name,
            dateOfBirth: aadhaarVerification.aadhaarData.dateOfBirth,
            gender: aadhaarVerification.aadhaarData.gender
          };
        }
      }

      // Check for legacy document verification (backward compatibility)
      const legacyDocs = user.verificationDocuments?.filter(doc => doc.status === 'approved') || [];
      if (legacyDocs.length > 0 && !user.isIdentityVerified) {
        // If user has approved documents but not Aadhaar verified, allow them to use legacy verification
        verificationData.hasLegacyVerification = true;
        verificationData.legacyDocuments = legacyDocs.length;
      }

      res.json({
        success: true,
        message: 'Verification status retrieved successfully',
        data: verificationData
      });

    } catch (error) {
      console.error('Get verification status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve verification status'
      });
    }
  }

  // Admin: Get pending verifications (for Aadhaar verifications that might need manual review)
  static async getPendingVerifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Get users with failed Aadhaar verifications that might need manual review
      const query = {
        role: { $in: ['artisan', 'distributor'] },
        $or: [
          { 'aadhaarVerification.verificationStatus': 'failed' },
          { 'aadhaarVerification.verificationAttempts': { $gte: 3 } },
          { 'verificationDocuments.status': 'pending' } // Legacy documents
        ]
      };

      const users = await User.find(query)
        .select('name email phone role aadhaarVerification verificationDocuments createdAt')
        .skip(skip)
        .limit(limit)
        .sort({ 'aadhaarVerification.lastAttemptAt': -1 });

      const total = await User.countDocuments(query);

      const verifications = users.map(user => ({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        userRole: user.role,
        aadhaarVerification: user.aadhaarVerification ? {
          status: user.aadhaarVerification.verificationStatus,
          maskedAadhaar: user.aadhaarVerification.maskedAadhaar,
          attempts: user.aadhaarVerification.verificationAttempts,
          lastAttempt: user.aadhaarVerification.lastAttemptAt
        } : null,
        legacyDocuments: user.verificationDocuments?.filter(doc => doc.status === 'pending')?.length || 0,
        needsReview: user.aadhaarVerification?.verificationAttempts >= 3 || user.verificationDocuments?.some(doc => doc.status === 'pending')
      }));

      res.json({
        success: true,
        message: 'Pending verifications retrieved successfully',
        data: {
          verifications,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total
        }
      });

    } catch (error) {
      console.error('Get pending verifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending verifications'
      });
    }
  }

  // Admin: Manually verify user (for cases where Aadhaar API fails)
  static async manuallyVerifyUser(req, res) {
    try {
      const { userId } = req.params;
      const { verified, notes } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!['artisan', 'distributor'].includes(user.role)) {
        return res.status(400).json({
          success: false,
          message: 'User role does not require verification'
        });
      }

      // Update verification status
      const updateData = {
        isIdentityVerified: verified,
        'aadhaarVerification.verificationStatus': verified ? 'verified' : 'failed',
        'aadhaarVerification.verifiedAt': verified ? new Date() : null,
        'aadhaarVerification.adminNotes': notes
      };

      await User.findByIdAndUpdate(userId, updateData);

      res.json({
        success: true,
        message: `User ${verified ? 'verified' : 'rejected'} successfully`,
        data: {
          userId,
          isIdentityVerified: verified,
          verifiedAt: verified ? new Date() : null,
          notes
        }
      });

    } catch (error) {
      console.error('Manual verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update verification status'
      });
    }
  }

  // Legacy methods for backward compatibility (deprecated but kept for existing integrations)
  static getUploadMiddleware() {
    // Return a no-op middleware since we're not using file uploads anymore
    return (req, res, next) => next();
  }

  static async uploadDocument(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Document upload is no longer supported. Please use Aadhaar verification instead.',
      migration: {
        newEndpoint: '/api/auth/verify/aadhaar/initiate',
        description: 'Use Aadhaar number + OTP verification for identity verification'
      }
    });
  }

  static async getVerificationDocuments(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('verificationDocuments aadhaarVerification isIdentityVerified');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Return Aadhaar verification status instead of documents
      const response = {
        verificationType: 'aadhaar',
        isIdentityVerified: user.isIdentityVerified,
        aadhaarVerification: user.aadhaarVerification ? {
          status: user.aadhaarVerification.verificationStatus,
          maskedAadhaar: user.aadhaarVerification.maskedAadhaar,
          verifiedAt: user.aadhaarVerification.verifiedAt
        } : null
      };

      // Include legacy documents if any exist
      if (user.verificationDocuments && user.verificationDocuments.length > 0) {
        response.legacyDocuments = user.verificationDocuments.map(doc => ({
          id: doc._id,
          type: doc.type,
          status: doc.status,
          uploadedAt: doc.uploadedAt,
          reviewedAt: doc.reviewedAt,
          reviewNotes: doc.reviewNotes
        }));
      }

      res.json({
        success: true,
        message: 'Verification information retrieved successfully',
        data: response
      });

    } catch (error) {
      console.error('Get verification documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve verification information'
      });
    }
  }

  static async reviewDocument(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Document review is no longer supported. Users should use Aadhaar verification.',
      migration: {
        newEndpoint: '/api/auth/admin/verify/:userId',
        description: 'Use manual verification endpoint for admin review of failed Aadhaar verifications'
      }
    });
  }

  static async downloadDocument(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Document download is no longer available. System now uses Aadhaar verification.',
      migration: {
        description: 'Document storage has been replaced with secure Aadhaar verification API'
      }
    });
  }
}

module.exports = IdentityVerificationController;
