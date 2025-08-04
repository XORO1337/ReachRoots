const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/Inventory_controller');

// Basic CRUD Operations
router.post('/', InventoryController.createInventory);
router.get('/', InventoryController.getAllInventories);
router.get('/:id', InventoryController.getInventoryById);
router.put('/:id', InventoryController.updateInventory);
router.delete('/:id', InventoryController.deleteInventory);

// Artisan-specific operations
router.get('/artisan/:artisanId', InventoryController.getInventoryByArtisanId);
router.delete('/artisan/:artisanId', InventoryController.deleteInventoryByArtisanId);

// Product management operations
router.post('/:id/products', InventoryController.addProduct);
router.delete('/:id/products/:productId', InventoryController.removeProduct);
router.patch('/:id/products/:productId/quantity', InventoryController.updateProductQuantity);

// Raw material management operations
router.post('/:id/raw-materials', InventoryController.addRawMaterial);
router.delete('/:id/raw-materials/:rawMaterialId', InventoryController.removeRawMaterial);
router.patch('/:id/raw-materials/:rawMaterialId/quantity', InventoryController.updateRawMaterialQuantity);

// Low stock monitoring
router.get('/:id/low-stock/products', InventoryController.getLowStockProducts);
router.get('/:id/low-stock/raw-materials', InventoryController.getLowStockRawMaterials);

module.exports = router;
