const express = require('express');
const router = express.Router();
const ArtisanService = require('../services/Artisan_serv');
const { 
  authenticateToken, 
  authorizeRoles, 
  requireIdentityVerification, 
  optionalAuth,
  validateResourceOwnership,
  requirePermission,
  detectMaliciousRequests,
  preventCrossUserAccess,
  securityAuditLogger
} = require('../middleware/auth');

// Public routes (anyone can search and view artisan profiles)
router.get('/search/skills', optionalAuth, async (req, res) => {
  try {
    const skills = req.query.skills ? req.query.skills.split(',') : [];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skills parameter is required'
      });
    }

    const result = await ArtisanService.searchArtisansBySkills(skills, page, limit);
    res.status(200).json({
      success: true,
      message: 'Artisans found by skills',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/search/region', optionalAuth, async (req, res) => {
  try {
    const region = req.query.region;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!region) {
      return res.status(400).json({
        success: false,
        message: 'Region parameter is required'
      });
    }

    const result = await ArtisanService.searchArtisansByRegion(region, page, limit);
    res.status(200).json({
      success: true,
      message: 'Artisans found by region',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Public routes for viewing artisan profiles
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    // Extract filters from query parameters
    if (req.query.region) filters.region = req.query.region;
    if (req.query.skills) {
      filters.skills = Array.isArray(req.query.skills) 
        ? req.query.skills 
        : req.query.skills.split(',');
    }

    const result = await ArtisanService.getAllArtisanProfiles(page, limit, filters);
    res.status(200).json({
      success: true,
      message: 'Artisan profiles retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const artisan = await ArtisanService.getArtisanProfileById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Artisan profile retrieved successfully',
      data: artisan
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const artisan = await ArtisanService.getArtisanProfileByUserId(req.params.userId);
    res.status(200).json({
      success: true,
      message: 'Artisan profile retrieved successfully',
      data: artisan
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Protected routes (only for authenticated artisans with enhanced security)
router.post('/', 
  authenticateToken, 
  authorizeRoles('artisan'), 
  detectMaliciousRequests,
  requirePermission('create', 'artisan'),
  securityAuditLogger('create', 'artisan'),
  async (req, res) => {
    try {
      // Auto-assign userId from authenticated user
      req.body.userId = req.user.id;
      
      const artisan = await ArtisanService.createArtisanProfile(req.body);
      res.status(201).json({
        success: true,
        message: 'Artisan profile created successfully',
        data: artisan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

// Routes that require identity verification for selling with enhanced security
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('artisan'), 
  detectMaliciousRequests,
  validateResourceOwnership('artisan'),
  requirePermission('update', 'artisan'),
  requireIdentityVerification,
  securityAuditLogger('update', 'artisan'),
  async (req, res) => {
    try {
      // Resource ownership already validated by middleware
      const artisan = await ArtisanService.updateArtisanProfile(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Artisan profile updated successfully',
        data: artisan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

router.put('/user/:userId', 
  authenticateToken, 
  authorizeRoles('artisan'), 
  detectMaliciousRequests,
  preventCrossUserAccess,
  requirePermission('update', 'artisan'),
  securityAuditLogger('update', 'artisan'),
  async (req, res) => {
    try {
      // Cross-user access already validated by middleware
      const artisan = await ArtisanService.updateArtisanProfileByUserId(req.params.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Artisan profile updated successfully',
        data: artisan
      });
    } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin-only deletion routes
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const artisan = await ArtisanService.deleteArtisanProfile(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Artisan profile deleted successfully',
      data: artisan
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/user/:userId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const artisan = await ArtisanService.deleteArtisanProfileByUserId(req.params.userId);
    res.status(200).json({
      success: true,
      message: 'Artisan profile deleted successfully',
      data: artisan
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Protected routes for profile management with enhanced security
router.patch('/:id/bank-details', 
  authenticateToken, 
  authorizeRoles('artisan'), 
  detectMaliciousRequests,
  validateResourceOwnership('artisan'),
  requirePermission('update', 'artisan'),
  requireIdentityVerification,
  securityAuditLogger('update', 'artisan'),
  async (req, res) => {
    try {
      // Resource ownership already validated by middleware
      const artisan = await ArtisanService.updateBankDetails(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Bank details updated successfully',
        data: artisan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

router.patch('/:id/skills/add', 
  authenticateToken, 
  authorizeRoles('artisan'), 
  detectMaliciousRequests,
  validateResourceOwnership('artisan'),
  requirePermission('update', 'artisan'),
  securityAuditLogger('update', 'artisan'),
  async (req, res) => {
    try {
      const { skill } = req.body;
      if (!skill) {
        return res.status(400).json({
          success: false,
          message: 'Skill is required'
        });
      }

      // Resource ownership already validated by middleware
      const artisan = await ArtisanService.addSkill(req.params.id, skill);
      res.status(200).json({
        success: true,
        message: 'Skill added successfully',
        data: artisan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

router.patch('/:id/skills/remove', 
  authenticateToken, 
  authorizeRoles('artisan'), 
  detectMaliciousRequests,
  validateResourceOwnership('artisan'),
  requirePermission('update', 'artisan'),
  securityAuditLogger('update', 'artisan'),
  async (req, res) => {
    try {
      const { skill } = req.body;
      if (!skill) {
        return res.status(400).json({
          success: false,
          message: 'Skill is required'
        });
      }

      // Resource ownership already validated by middleware
      const artisan = await ArtisanService.removeSkill(req.params.id, skill);
      res.status(200).json({
        success: true,
        message: 'Skill removed successfully',
        data: artisan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

module.exports = router;
