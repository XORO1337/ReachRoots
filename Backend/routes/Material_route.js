const express = require('express');
const MaterialController = require('../controllers/Material_controller');
const router = express.Router();

// Create material
router.post('/', MaterialController.createMaterial);

// Get all materials
router.get('/', MaterialController.getAllMaterials);

// Get materials by category
router.get('/category/:category', MaterialController.getMaterialsByCategory);

// Get materials by supplier
router.get('/supplier/:supplierId', MaterialController.getMaterialsBySupplier);

// Get low stock materials
router.get('/inventory/low-stock', MaterialController.getLowStockMaterials);

// Search materials
router.get('/search/materials', MaterialController.searchMaterials);

// Get material categories
router.get('/categories/all', MaterialController.getMaterialCategories);

// Get material by ID (must come after specific routes)
router.get('/:id', MaterialController.getMaterialById);

// Update material by ID
router.put('/:id', MaterialController.updateMaterial);

// Delete material by ID
router.delete('/:id', MaterialController.deleteMaterial);

// Update material stock
router.patch('/:id/stock', MaterialController.updateMaterialStock);

module.exports = router;