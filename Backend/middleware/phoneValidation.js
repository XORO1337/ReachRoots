// Phone validation only (for send-otp and resend-otp)
const validatePhoneOnly = [
  body('phone')
    .matches(/^[+]?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number')
    .trim(),
    
  handleValidationErrors
];
