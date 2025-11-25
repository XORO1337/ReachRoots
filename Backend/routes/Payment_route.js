const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/Payment_controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/razorpay/order', authenticateToken, PaymentController.createRazorpayOrder);
router.post('/razorpay/verify', authenticateToken, PaymentController.verifyRazorpayPayment);
router.post('/razorpay/failure', authenticateToken, PaymentController.markPaymentFailed);

module.exports = router;
