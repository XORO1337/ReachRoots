import React, { useState } from 'react';
<<<<<<< HEAD
=======
import { useTranslation } from 'react-i18next';
>>>>>>> fixed-repo/main
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Palette, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl, buildGoogleOAuthUrl, API_CONFIG } from '../../config/api';
import OTPVerification from '../../components/auth/OTPVerification';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: 'customer' | 'artisan' | 'distributor';
  // Role-specific fields
  bio?: string;
  region?: string;
  skills?: string;
  businessName?: string;
  licenseNumber?: string;
  distributionAreas?: string;
}

const Signup: React.FC = () => {
<<<<<<< HEAD
=======
  const { t } = useTranslation();
>>>>>>> fixed-repo/main
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Name validation
    if (!formData.fullName.trim()) {
<<<<<<< HEAD
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters long';
=======
      errors.fullName = t('validation.nameRequired');
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = t('validation.nameMinLength');
>>>>>>> fixed-repo/main
    }

    // Email validation
    if (!formData.email) {
<<<<<<< HEAD
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
=======
      errors.email = t('validation.emailRequired');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = t('validation.emailInvalid');
>>>>>>> fixed-repo/main
    }

    // Password validation
    if (!formData.password) {
<<<<<<< HEAD
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
=======
      errors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 8) {
      errors.password = t('validation.passwordMinLengthSignup');
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = t('validation.passwordComplex');
>>>>>>> fixed-repo/main
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
<<<<<<< HEAD
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
=======
      errors.confirmPassword = t('validation.passwordConfirmRequired');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('validation.passwordMismatch');
>>>>>>> fixed-repo/main
    }

    // Phone number validation
    if (!formData.phoneNumber) {
<<<<<<< HEAD
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit Indian phone number';
=======
      errors.phoneNumber = t('validation.phoneRequired');
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = t('validation.phoneInvalid');
>>>>>>> fixed-repo/main
    }

    // Role-specific validations
    if (formData.role === 'artisan') {
      if (!formData.region?.trim()) {
<<<<<<< HEAD
        errors.region = 'Region is required for artisans';
      }
    } else if (formData.role === 'distributor') {
      if (!formData.businessName?.trim()) {
        errors.businessName = 'Business name is required for distributors';
      }
      if (!formData.distributionAreas?.trim()) {
        errors.distributionAreas = 'Distribution areas are required for distributors';
=======
        errors.region = t('validation.regionRequired');
      }
    } else if (formData.role === 'distributor') {
      if (!formData.businessName?.trim()) {
        errors.businessName = t('validation.businessNameRequired');
      }
      if (!formData.distributionAreas?.trim()) {
        errors.distributionAreas = t('validation.distributionAreasRequired');
>>>>>>> fixed-repo/main
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const parseBackendError = (errorMessage: string) => {
    // Parse specific backend error messages
    if (errorMessage.includes('User with this email already exists')) {
<<<<<<< HEAD
      return 'An account with this email address already exists. Please try logging in instead.';
    }
    if (errorMessage.includes('User with this phone number already exists')) {
      return 'An account with this phone number already exists. Please try logging in instead.';
=======
      return t('errors.emailExists');
    }
    if (errorMessage.includes('User with this phone number already exists')) {
      return t('errors.phoneExists');
>>>>>>> fixed-repo/main
    }
    if (errorMessage.includes('Password must contain')) {
      return errorMessage; // Return the specific password validation message
    }
    if (errorMessage.includes('Please enter a valid email')) {
<<<<<<< HEAD
      return 'The email address format is invalid. Please check and try again.';
    }
    if (errorMessage.includes('Please enter a valid phone number')) {
      return 'The phone number format is invalid. Please check and try again.';
    }
    if (errorMessage.includes('validation failed')) {
      return 'Please check your information and ensure all required fields are properly filled.';
    }
    if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    if (errorMessage.includes('profile_creation_failed')) {
      return 'Account created but profile setup failed. Please contact support or try logging in.';
=======
      return t('errors.invalidEmailFormat');
    }
    if (errorMessage.includes('Please enter a valid phone number')) {
      return t('errors.invalidPhoneFormat');
    }
    if (errorMessage.includes('validation failed')) {
      return t('errors.validationFailed');
    }
    if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
      return t('errors.networkError');
    }
    if (errorMessage.includes('profile_creation_failed')) {
      return t('errors.profileCreationFailed');
>>>>>>> fixed-repo/main
    }
    
    return errorMessage; // Return original message if no specific handling
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (role: 'customer' | 'artisan' | 'distributor') => {
    setFormData(prev => ({
      fullName: prev.fullName,
      email: prev.email,
      password: prev.password,
      confirmPassword: prev.confirmPassword,
      phoneNumber: prev.phoneNumber,
      role,
      // Clear role-specific fields when changing role
      bio: '',
      region: '',
      skills: '',
      businessName: '',
      licenseNumber: '',
      distributionAreas: '',
    }));
    // Clear validation errors when changing role
    setValidationErrors({});
    setError('');
  };

  const handleSignupSuccess = (payload: any) => {
    console.log('🔍 Signup Debug - User data from backend:', payload);
    const user = payload?.user || payload;
    const accessToken = payload?.accessToken;

    if (!user || !accessToken) {
      console.error('Signup success payload missing user or access token');
<<<<<<< HEAD
      setError('Registration completed but authentication failed. Please try logging in.');
=======
      setError(t('errors.authenticationFailed'));
>>>>>>> fixed-repo/main
      return;
    }

    const userDataForAuth = {
      id: user.id || user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      photoURL: user.photoURL,
      location: user.location,
      bio: user.bio,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified || false,
      isIdentityVerified: user.isIdentityVerified || false,
    };

    login(userDataForAuth, accessToken);

    const role = userDataForAuth.role || payload?.role;
    if (role === 'artisan') {
      navigate('/artisan');
    } else if (role === 'distributor') {
      navigate('/distributor');
    } else {
      navigate('/');
    }
  };

  const handleOTPVerified = (userData: any) => {
    setShowOTPVerification(false);
    handleSignupSuccess(userData);
  };

  const handleOTPCancel = () => {
    setShowOTPVerification(false);
<<<<<<< HEAD
    setError('Registration cancelled. Your account was created but not verified. Please log in to verify your email.');
=======
    setError(t('errors.registrationCancelled'));
>>>>>>> fixed-repo/main
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setValidationErrors({});

    // Validate form before submitting
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
      };

      // Add role-specific data
      if (formData.role === 'artisan') {
        payload.bio = formData.bio;
        payload.region = formData.region;
        payload.skills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
      } else if (formData.role === 'distributor') {
        payload.businessName = formData.businessName;
        payload.licenseNumber = formData.licenseNumber;
        payload.distributionAreas = formData.distributionAreas
          ? formData.distributionAreas.split(',').map(s => s.trim())
          : [];
      }

      console.log('Sending registration payload:', payload);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Check if OTP was sent successfully
        if (data.data.otpSent) {
          setPendingUserData(data.data);
          setShowOTPVerification(true);
        } else {
          // Handle case where OTP sending failed but user was created
<<<<<<< HEAD
          setError('Registration successful but OTP sending failed. Please contact support.');
=======
          setError(t('errors.otpSendingFailed'));
>>>>>>> fixed-repo/main
        }
      } else {
        const errorMessage = parseBackendError(data.message || 'Registration failed. Please try again.');
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
<<<<<<< HEAD
      let errorMessage = 'An error occurred during registration. Please try again.';
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
=======
      let errorMessage = t('errors.registrationError');
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = t('errors.networkError');
>>>>>>> fixed-repo/main
      } else if (error.message) {
        errorMessage = parseBackendError(error.message);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Store selected role in sessionStorage for OAuth callback
    sessionStorage.setItem('selectedRole', formData.role);
    const googleUrl = buildGoogleOAuthUrl(formData.role);
    console.log('🔗 Google OAuth URL:', googleUrl);
    console.log('🌍 Current hostname:', window.location.hostname);
    console.log('🏠 API Base URL:', API_CONFIG.BASE_URL);
    window.location.href = googleUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-10 w-16 h-16 bg-amber-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      <div className="absolute bottom-1/4 left-20 w-24 h-24 bg-yellow-300 rounded-full opacity-20 animate-pulse delay-700"></div>

      {/* Decorative craft icons */}
      <div className="absolute top-20 right-1/4 text-orange-200 opacity-30">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
        </svg>
      </div>
      <div className="absolute bottom-32 left-1/4 text-yellow-300 opacity-30">
        <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
        </svg>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us to discover authentic handmade crafts</p>
=======
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('auth.createAccount')}</h1>
          <p className="text-gray-600">{t('auth.joinCommunity')}</p>
>>>>>>> fixed-repo/main
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6">
<<<<<<< HEAD
          <label className="block text-sm font-medium text-gray-700 mb-3">I want to join as:</label>
=======
          <label className="block text-sm font-medium text-gray-700 mb-3">{t('auth.signupAs')}</label>
>>>>>>> fixed-repo/main
          <div className="grid grid-cols-1 gap-3">
            {/* Customer Role */}
            <button
              type="button"
              onClick={() => handleRoleChange('customer')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.role === 'customer' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className={`h-5 w-5 ${formData.role === 'customer' ? 'text-orange-500' : 'text-gray-400'}`} />
                <div>
<<<<<<< HEAD
                  <div className="font-medium text-gray-900">Customer</div>
                  <div className="text-sm text-gray-500">Browse and purchase handmade crafts</div>
=======
                  <div className="font-medium text-gray-900">{t('auth.customer')}</div>
                  <div className="text-sm text-gray-500">{t('auth.customerSignupDesc')}</div>
>>>>>>> fixed-repo/main
                </div>
              </div>
            </button>

            {/* Artisan Role */}
            <button
              type="button"
              onClick={() => handleRoleChange('artisan')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.role === 'artisan' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Palette className={`h-5 w-5 ${formData.role === 'artisan' ? 'text-orange-500' : 'text-gray-400'}`} />
                <div>
<<<<<<< HEAD
                  <div className="font-medium text-gray-900">Artisan</div>
                  <div className="text-sm text-gray-500">Sell your handmade crafts and manage orders</div>
=======
                  <div className="font-medium text-gray-900">{t('auth.artisan')}</div>
                  <div className="text-sm text-gray-500">{t('auth.artisanSignupDesc')}</div>
>>>>>>> fixed-repo/main
                </div>
              </div>
            </button>

            {/* Distributor Role */}
            <button
              type="button"
              onClick={() => handleRoleChange('distributor')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.role === 'distributor'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className={`h-5 w-5 ${formData.role === 'distributor' ? 'text-orange-500' : 'text-gray-400'}`} />
                <div>
<<<<<<< HEAD
                  <div className="font-medium text-gray-900">Distributor</div>
                  <div className="text-sm text-gray-500">Manage inventory and distribute products</div>
=======
                  <div className="font-medium text-gray-900">{t('auth.distributor')}</div>
                  <div className="text-sm text-gray-500">{t('auth.distributorSignupDesc')}</div>
>>>>>>> fixed-repo/main
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
              Full Name
=======
              {t('auth.fullName')}
>>>>>>> fixed-repo/main
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
<<<<<<< HEAD
              placeholder="Enter your full name"
=======
              placeholder={t('auth.enterFullName')}
>>>>>>> fixed-repo/main
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white ${
                validationErrors.fullName 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              required
            />
            {validationErrors.fullName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
              Email Address
=======
              {t('auth.emailAddress')}
>>>>>>> fixed-repo/main
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
<<<<<<< HEAD
              placeholder="Enter your email address"
=======
              placeholder={t('auth.enterEmail')}
>>>>>>> fixed-repo/main
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white ${
                validationErrors.email 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              required
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
              Password
=======
              {t('auth.password')}
>>>>>>> fixed-repo/main
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
<<<<<<< HEAD
                placeholder="Enter your password"
=======
                placeholder={t('auth.enterPassword')}
>>>>>>> fixed-repo/main
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white ${
                  validationErrors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
<<<<<<< HEAD
              Must contain at least 8 characters with uppercase, lowercase, number, and special character
=======
              {t('signup.passwordHint')}
>>>>>>> fixed-repo/main
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
              Confirm Password
=======
              {t('auth.confirmPassword')}
>>>>>>> fixed-repo/main
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
<<<<<<< HEAD
                placeholder="Confirm your password"
=======
                placeholder={t('auth.confirmYourPassword')}
>>>>>>> fixed-repo/main
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white ${
                  validationErrors.confirmPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
              Phone Number
=======
              {t('auth.phoneNumber')}
>>>>>>> fixed-repo/main
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
<<<<<<< HEAD
              placeholder="Enter your 10-digit phone number"
=======
              placeholder={t('auth.enterPhoneNumber')}
>>>>>>> fixed-repo/main
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white ${
                validationErrors.phoneNumber 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              required
            />
            {validationErrors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
<<<<<<< HEAD
              Enter a valid 10-digit Indian phone number
=======
              {t('signup.phoneHint')}
>>>>>>> fixed-repo/main
            </p>
          </div>

          {/* Role-specific fields */}
          {formData.role === 'artisan' && (
            <>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  Bio (Optional)
=======
                  {t('auth.bio')}
>>>>>>> fixed-repo/main
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
<<<<<<< HEAD
                  placeholder="Tell us about your craft and experience"
=======
                  placeholder={t('auth.tellUsAboutYourself')}
>>>>>>> fixed-repo/main
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white resize-none"
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  Region
=======
                  {t('auth.region')}
>>>>>>> fixed-repo/main
                </label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region || ''}
                  onChange={handleInputChange}
<<<<<<< HEAD
                  placeholder="e.g., Maharashtra, Rajasthan"
=======
                  placeholder={t('auth.enterRegion')}
>>>>>>> fixed-repo/main
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  Skills (Optional)
=======
                  {t('auth.skills')}
>>>>>>> fixed-repo/main
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills || ''}
                  onChange={handleInputChange}
<<<<<<< HEAD
                  placeholder="e.g., pottery, woodworking, textile (comma-separated)"
=======
                  placeholder={t('auth.enterSkills')}
>>>>>>> fixed-repo/main
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
            </>
          )}

          {formData.role === 'distributor' && (
            <>
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  Business Name
=======
                  {t('auth.businessName')}
>>>>>>> fixed-repo/main
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName || ''}
                  onChange={handleInputChange}
<<<<<<< HEAD
                  placeholder="Enter your business name"
=======
                  placeholder={t('auth.enterBusinessName')}
>>>>>>> fixed-repo/main
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  License Number (Optional)
=======
                  {t('auth.licenseNumber')}
>>>>>>> fixed-repo/main
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleInputChange}
<<<<<<< HEAD
                  placeholder="Enter your business license number"
=======
                  placeholder={t('auth.enterLicenseNumber')}
>>>>>>> fixed-repo/main
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label htmlFor="distributionAreas" className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  Distribution Areas (Optional)
=======
                  {t('auth.distributionAreas')}
>>>>>>> fixed-repo/main
                </label>
                <input
                  type="text"
                  id="distributionAreas"
                  name="distributionAreas"
                  value={formData.distributionAreas || ''}
                  onChange={handleInputChange}
<<<<<<< HEAD
                  placeholder="e.g., Mumbai, Pune, Nashik (comma-separated)"
=======
                  placeholder={t('auth.enterDistributionAreas')}
>>>>>>> fixed-repo/main
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
            </>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
<<<<<<< HEAD
            {isLoading ? 'Creating Account...' : 'Create Account'}
=======
            {isLoading ? t('signup.creatingAccount') : t('auth.createAccount')}
>>>>>>> fixed-repo/main
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
<<<<<<< HEAD
            <span className="px-4 text-sm text-gray-500 bg-white">OR CONTINUE WITH</span>
=======
            <span className="px-4 text-sm text-gray-500 bg-white">{t('signup.orContinueWith')}</span>
>>>>>>> fixed-repo/main
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
<<<<<<< HEAD
            Continue with Google
=======
            {t('auth.signUpWithGoogle')}
>>>>>>> fixed-repo/main
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
<<<<<<< HEAD
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
              Sign in
=======
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
              {t('auth.login')}
>>>>>>> fixed-repo/main
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <OTPVerification
          email={formData.email}
          action="signup"
          onVerified={handleOTPVerified}
          onCancel={handleOTPCancel}
          devOtpCode={pendingUserData?.devOtpCode}
        />
      )}
    </div>
  );
};

export default Signup;