const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth_controller');
const AddressController = require('../controllers/Address_controller');
const IdentityVerificationController = require('../controllers/IdentityVerification_controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { authLimit, otpLimit, generalLimit } = require('../middleware/rateLimiting');
const {
  validateUserRegistration,
  validateUserLogin,
  validateOTP,
  validateAddress,
  validateIdentityDocument,
  validateAadhaarNumber,
  validateAadhaarOTP,
  validateManualVerification,
  validatePasswordChange,
  validateObjectId,
  validatePhoneOnly,
  validateEmailOnly
} = require('../middleware/validation');

// ========== AUTHENTICATION ROUTES ==========

// Register with email or phone
router.post('/register', authLimit, validateUserRegistration, AuthController.registerWithEmailOTP);

// Login with phone/email and password
router.post('/login', authLimit, validateUserLogin, AuthController.loginWithEmailOTP);

// Google OAuth routes
router.get('/google', AuthController.initiateGoogleAuth);
router.get('/google/callback', AuthController.handleGoogleCallback);

// Debug route to check user role (temporary)
router.get('/debug/user-role/:email', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ email: req.params.email }).select('name email role');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// OTP routes
router.post('/send-otp', otpLimit, validateEmailOnly, AuthController.sendOTP);
router.post('/resend-otp', otpLimit, validateEmailOnly, AuthController.resendOTP);
router.get('/otp-status', generalLimit, AuthController.getOTPStatus);
router.post('/verify-otp', authLimit, validateOTP, AuthController.verifyOTP);

// Token management
router.post('/refresh-token', generalLimit, AuthController.refreshToken);
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/logout-all', authenticateToken, AuthController.logoutAll);

// Profile management
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/change-password', authenticateToken, validatePasswordChange, AuthController.changePassword);

// ========== ADDRESS MANAGEMENT ROUTES ==========

// Address routes (only for authenticated users)
router.post('/addresses', authenticateToken, validateAddress, AddressController.addAddress);
router.get('/addresses', authenticateToken, AddressController.getAddresses);
router.get('/addresses/default', authenticateToken, AddressController.getDefaultAddress);
router.get('/addresses/:addressId', authenticateToken, validateObjectId, AddressController.getAddressById);
router.put('/addresses/:addressId', authenticateToken, validateObjectId, validateAddress, AddressController.updateAddress);
router.delete('/addresses/:addressId', authenticateToken, validateObjectId, AddressController.deleteAddress);
router.patch('/addresses/:addressId/set-default', authenticateToken, validateObjectId, AddressController.setDefaultAddress);

// ========== IDENTITY VERIFICATION ROUTES ==========

// Aadhaar verification routes (only for artisans and distributors)
router.post('/verification/aadhaar/initiate',
  authenticateToken,
  authorizeRoles('artisan', 'distributor'),
  validateAadhaarNumber,
  IdentityVerificationController.initiateAadhaarVerification
);

router.post('/verification/aadhaar/verify',
  authenticateToken,
  authorizeRoles('artisan', 'distributor'),
  validateAadhaarOTP,
  IdentityVerificationController.verifyAadhaarOTP
);

// Legacy document upload routes (deprecated but kept for backward compatibility)
router.post('/verification/upload',
  authenticateToken,
  authorizeRoles('artisan', 'distributor'),
  validateIdentityDocument,
  IdentityVerificationController.getUploadMiddleware(),
  IdentityVerificationController.uploadDocument
);

router.get('/verification/documents',
  authenticateToken,
  authorizeRoles('artisan', 'distributor'),
  IdentityVerificationController.getVerificationDocuments
);

router.get('/verification/status',
  authenticateToken,
  IdentityVerificationController.getVerificationStatus
);

// ========== ADMIN ROUTES FOR VERIFICATION ==========

// Admin routes for reviewing verifications
router.get('/admin/verifications/pending',
  authenticateToken,
  authorizeRoles('admin'),
  IdentityVerificationController.getPendingVerifications
);

router.patch('/admin/verifications/:userId/manual-verify',
  authenticateToken,
  authorizeRoles('admin'),
  validateManualVerification,
  IdentityVerificationController.manuallyVerifyUser
);

// Legacy admin routes (deprecated)
router.patch('/admin/verifications/:userId/:documentId',
  authenticateToken,
  authorizeRoles('admin'),
  IdentityVerificationController.reviewDocument
);

router.get('/admin/verifications/:userId/:documentId/download',
  authenticateToken,
  authorizeRoles('admin'),
  IdentityVerificationController.downloadDocument
);

module.exports = router;
