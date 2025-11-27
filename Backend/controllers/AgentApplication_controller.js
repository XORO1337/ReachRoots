const AgentApplicationService = require('../services/AgentApplication_serv.js');

/**
 * Agent Application Controller
 * Handles HTTP requests for agent application workflow
 */
class AgentApplicationController {
  
  /**
   * POST /api/agent-applications/submit
   * Public endpoint - Submit new agent application
   */
  static async submitApplication(req, res) {
    try {
      const applicationData = req.body;
      
      // Add submission metadata
      const submissionMeta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent')
      };
      
      const result = await AgentApplicationService.submitApplication(applicationData, submissionMeta);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          applicationId: result.applicationId,
          status: result.status
        }
      });
    } catch (error) {
      console.error('Submit application error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to submit application',
        ...(error.applicationId && { 
          existingApplicationId: error.applicationId,
          existingStatus: error.status 
        })
      });
    }
  }
  
  /**
   * GET /api/agent-applications/status/:identifier
   * Public endpoint - Check application status
   */
  static async getApplicationStatus(req, res) {
    try {
      const { identifier } = req.params;
      
      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Application ID or email is required'
        });
      }
      
      const status = await AgentApplicationService.getApplicationStatus(identifier);
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to get application status'
      });
    }
  }
  
  /**
   * GET /api/admin/agent-applications
   * Admin endpoint - Get all applications with filters
   */
  static async getAllApplications(req, res) {
    try {
      const { status, search, fromDate, toDate, page, limit, sortBy, sortOrder } = req.query;
      
      const filters = { status, search, fromDate, toDate };
      const pagination = { 
        page: parseInt(page) || 1, 
        limit: parseInt(limit) || 20,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      };
      
      const result = await AgentApplicationService.getAllApplications(filters, pagination);
      
      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch applications'
      });
    }
  }
  
  /**
   * GET /api/admin/agent-applications/:applicationId
   * Admin endpoint - Get single application details
   */
  static async getApplicationById(req, res) {
    try {
      const { applicationId } = req.params;
      
      const application = await AgentApplicationService.getApplicationById(applicationId);
      
      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch application'
      });
    }
  }
  
  /**
   * POST /api/admin/agent-applications/:applicationId/review
   * Admin endpoint - Mark application as under review
   */
  static async markUnderReview(req, res) {
    try {
      const { applicationId } = req.params;
      const adminId = req.user._id;
      
      const result = await AgentApplicationService.markUnderReview(applicationId, adminId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update application status'
      });
    }
  }
  
  /**
   * POST /api/admin/agent-applications/:applicationId/request-info
   * Admin endpoint - Request additional information
   */
  static async requestMoreInfo(req, res) {
    try {
      const { applicationId } = req.params;
      const { requestedInfo } = req.body;
      const adminId = req.user._id;
      
      if (!requestedInfo) {
        return res.status(400).json({
          success: false,
          message: 'Please specify what additional information is needed'
        });
      }
      
      const result = await AgentApplicationService.requestMoreInfo(applicationId, adminId, requestedInfo);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to request additional information'
      });
    }
  }
  
  /**
   * POST /api/admin/agent-applications/:applicationId/approve
   * Admin endpoint - Approve application
   */
  static async approveApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { notes } = req.body;
      const adminId = req.user._id;
      
      const result = await AgentApplicationService.approveApplication(applicationId, adminId, notes);
      
      res.json({
        success: true,
        message: result.message,
        data: {
          agentId: result.agentId,
          agentEmail: result.agentEmail,
          // In production, don't return password - send via email only
          tempPassword: result.tempPassword
        }
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to approve application'
      });
    }
  }
  
  /**
   * POST /api/admin/agent-applications/:applicationId/reject
   * Admin endpoint - Reject application
   */
  static async rejectApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { rejectionReason } = req.body;
      const adminId = req.user._id;
      
      const result = await AgentApplicationService.rejectApplication(applicationId, adminId, rejectionReason);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to reject application'
      });
    }
  }
  
  /**
   * POST /api/admin/agent-applications/:applicationId/verify-document
   * Admin endpoint - Verify a document
   */
  static async verifyDocument(req, res) {
    try {
      const { applicationId } = req.params;
      const { documentType } = req.body;
      const adminId = req.user._id;
      
      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: 'Document type is required'
        });
      }
      
      const result = await AgentApplicationService.verifyDocument(applicationId, documentType, adminId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to verify document'
      });
    }
  }
  
  /**
   * GET /api/admin/agent-applications/stats
   * Admin endpoint - Get application statistics
   */
  static async getApplicationStats(req, res) {
    try {
      const stats = await AgentApplicationService.getApplicationStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch statistics'
      });
    }
  }
}

module.exports = AgentApplicationController;
