const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/Payment_controller');
const { authenticateToken } = require('../middleware/auth');

<<<<<<< HEAD
=======
// Check payment methods availability (public route)
router.get('/availability', PaymentController.checkPaymentAvailability);

>>>>>>> fixed-repo/main
router.post('/razorpay/order', authenticateToken, PaymentController.createRazorpayOrder);
router.post('/razorpay/verify', authenticateToken, PaymentController.verifyRazorpayPayment);
router.post('/razorpay/failure', authenticateToken, PaymentController.markPaymentFailed);

module.exports = router;
