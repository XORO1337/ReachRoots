const express = require('express');
const router = express.Router();
const DistributorService = require('../services/Distributor_serv');

// Create a new distributor profile
router.post('/', async (req, res) => {
  try {
    const distributor = await DistributorService.createDistributorProfile(req.body);
    res.status(201).json({
      success: true,
      message: 'Distributor profile created successfully',
      data: distributor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all distributor profiles with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    // Extract filters from query parameters
    if (req.query.businessName) filters.businessName = req.query.businessName;
    if (req.query.distributionAreas) {
      filters.distributionAreas = Array.isArray(req.query.distributionAreas) 
        ? req.query.distributionAreas 
        : req.query.distributionAreas.split(',');
    }

    const result = await DistributorService.getAllDistributorProfiles(page, limit, filters);
    res.status(200).json({
      success: true,
      message: 'Distributor profiles retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get distributor profile by ID
router.get('/:id', async (req, res) => {
  try {
    const distributor = await DistributorService.getDistributorProfileById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Distributor profile retrieved successfully',
      data: distributor
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Get distributor profile by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const distributor = await DistributorService.getDistributorProfileByUserId(req.params.userId);
    res.status(200).json({
      success: true,
      message: 'Distributor profile retrieved successfully',
      data: distributor
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Update distributor profile by ID
router.put('/:id', async (req, res) => {
  try {
    const distributor = await DistributorService.updateDistributorProfile(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Distributor profile updated successfully',
      data: distributor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update distributor profile by user ID
router.put('/user/:userId', async (req, res) => {
  try {
    const distributor = await DistributorService.updateDistributorProfileByUserId(req.params.userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Distributor profile updated successfully',
      data: distributor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete distributor profile by ID
router.delete('/:id', async (req, res) => {
  try {
    const distributor = await DistributorService.deleteDistributorProfile(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Distributor profile deleted successfully',
      data: distributor
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Delete distributor profile by user ID
router.delete('/user/:userId', async (req, res) => {
  try {
    const distributor = await DistributorService.deleteDistributorProfileByUserId(req.params.userId);
    res.status(200).json({
      success: true,
      message: 'Distributor profile deleted successfully',
      data: distributor
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Search distributors by distribution areas
router.get('/search/areas', async (req, res) => {
  try {
    const areas = req.query.areas ? req.query.areas.split(',') : [];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (areas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Areas parameter is required'
      });
    }

    const result = await DistributorService.searchDistributorsByAreas(areas, page, limit);
    res.status(200).json({
      success: true,
      message: 'Distributors found by areas',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Search distributors by business name
router.get('/search/business-name', async (req, res) => {
  try {
    const businessName = req.query.businessName;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: 'Business name parameter is required'
      });
    }

    const result = await DistributorService.searchDistributorsByBusinessName(businessName, page, limit);
    res.status(200).json({
      success: true,
      message: 'Distributors found by business name',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add distribution area to distributor
router.patch('/:id/areas/add', async (req, res) => {
  try {
    const { area } = req.body;
    if (!area) {
      return res.status(400).json({
        success: false,
        message: 'Distribution area is required'
      });
    }

    const distributor = await DistributorService.addDistributionArea(req.params.id, area);
    res.status(200).json({
      success: true,
      message: 'Distribution area added successfully',
      data: distributor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Remove distribution area from distributor
router.patch('/:id/areas/remove', async (req, res) => {
  try {
    const { area } = req.body;
    if (!area) {
      return res.status(400).json({
        success: false,
        message: 'Distribution area is required'
      });
    }

    const distributor = await DistributorService.removeDistributionArea(req.params.id, area);
    res.status(200).json({
      success: true,
      message: 'Distribution area removed successfully',
      data: distributor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;