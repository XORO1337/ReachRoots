const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
let otpService;
try {
  otpService = require('../services/otpService');
} catch (error) {
  const fs = require('fs');
  const path = require('path');
  const diagnosticsPath = path.join(__dirname, '..', 'logs', 'otp-service-error.log');
  try {
    fs.writeFileSync(
      diagnosticsPath,
      `Failed to load OTP service at ${new Date().toISOString()}\n${error?.stack || error?.message || error}`,
      { encoding: 'utf8' }
    );
  } catch (fileError) {
    console.error('Failed to persist OTP service error diagnostics:', fileError);
  }
  console.error('Failed to load OTP service:', error);
  throw error;
}
const passport = require('../config/passport');
const { getClientURL } = require('../config/environment');

const normalizeRedirectUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch (error) {
    return null;
  }
};

const resolveClientUrl = (req, extraCandidates = []) => {
  let redirectParam = null;
  if (req.query?.redirect) {
    try {
      redirectParam = decodeURIComponent(req.query.redirect);
    } catch (error) {
      redirectParam = req.query.redirect;
    }
  }

  const refererOrigin = (() => {
    const referer = req.get('Referer');
    if (!referer) return null;
    try {
      return new URL(referer).origin;
    } catch (error) {
      return null;
    }
  })();

  const candidates = [
    ...extraCandidates,
    redirectParam,
    req.query?.clientUrl,
    req.session?.oauthClientUrl,
    req.get('Origin'),
    refererOrigin,
    process.env.CLIENT_URL,
    getClientURL(),
    'http://localhost:5173'
  ];

  for (const candidate of candidates) {
    const normalized = normalizeRedirectUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return 'http://localhost:5173';
};

class AuthController {
  static formatUserPayload(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      photoURL: user.profileImage?.url || null,
      profileImage: user.profileImage ? {
        url: user.profileImage.url,
        thumbnailUrl: user.profileImage.thumbnailUrl,
        fileId: user.profileImage.fileId,
        uploadedAt: user.profileImage.uploadedAt
      } : null,
      location: user.location || '',
      bio: user.bio || '',
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isIdentityVerified: user.isIdentityVerified
    };
  }

  static async finalizeLoginSession(user, res, { roleChanged = false, message = 'Login successful', meta = {} } = {}) {
    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id });

    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    return res.json({
      success: true,
      message,
      data: {
        user: AuthController.formatUserPayload(user),
        accessToken,
        roleChanged,
        requiresOTP: false,
        ...meta
      }
    });
  }

  // Email based Registration with OTP
  static async registerWithEmailOTP(req, res) {
    let createdUser = null;
    try {
      const { name, email, password, role, bio, region, skills, businessName, licenseNumber, distributionAreas } = req.body;
      if (!name || !password || !role || !email) {
        return res.status(400).json({ success: false, message: 'Name, password, role, and email are required' });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
      const user = new User({
        name,
        email,
        password,
        role: role || 'customer',
        authProvider: 'local',
        isEmailVerified: false
      });
      await user.save();
      createdUser = user;

      await AuthController.createRoleSpecificProfile(user._id, role, { bio, region, skills, businessName, licenseNumber, distributionAreas });

      const userPayload = AuthController.formatUserPayload(user);

      const otpResult = await otpService.sendOTP(email);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email address with the OTP sent to your email.',
        data: {
          user: userPayload,
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          otpSent: true,
          otpExpires: otpResult.expiresAt,
<<<<<<< HEAD
          otpDeliveryIssue: false
=======
          otpDeliveryIssue: false,
          devOtpCode: otpResult.devOtpCode
>>>>>>> fixed-repo/main
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (createdUser?._id) {
        await AuthController.rollbackFailedRegistration(createdUser._id, createdUser.role);
      }
      const statusCode = error.statusCode || (error.otpDeliveryFailure ? 503 : 400);
      const message = error.otpDeliveryFailure
        ? error.message || 'Registration failed because we could not deliver the verification code. Please try again later.'
        : error.message || 'Registration failed';
      res.status(statusCode).json({ success: false, message });
    }
  }

  // Login with email only (OTP sent to email)
  static async loginWithEmailOTP(req, res) {
    try {
      const { email, password, role } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (user.isLocked) {
        return res.status(423).json({ success: false, message: 'Account is temporarily locked due to too many failed login attempts' });
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }
      let roleChanged = false;
      if (role && role !== user.role && ['customer', 'artisan', 'distributor'].includes(role)) {
        user.role = role;
        roleChanged = true;
        await user.save();
        if (role === 'artisan' || role === 'distributor') {
          try {
            await AuthController.createRoleSpecificProfile(user._id, role, {});
          } catch (error) {}
        }
      }
      
      try {
        const otpResult = await otpService.sendOTP(email, user._id);
        const userPayload = AuthController.formatUserPayload(user);

        return res.json({
          success: true,
          message: 'Credentials verified. Please check your email for OTP to complete login.',
          data: {
            user: userPayload,
            roleChanged,
            otpSent: true,
            requiresOTP: true,
            otpExpires: otpResult.expiresAt,
<<<<<<< HEAD
            otpDeliveryIssue: false
=======
            otpDeliveryIssue: false,
            devOtpCode: otpResult.devOtpCode
>>>>>>> fixed-repo/main
          }
        });
      } catch (otpError) {
        console.error('OTP sending failed:', otpError);
        const statusCode = otpError.statusCode || 503;
        return res.status(statusCode).json({ 
          success: false, 
          message: otpError.message || 'Login verification failed. Please try again.',
          data: {
            requiresOTP: true,
            otpDeliveryIssue: true
          } 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }

<<<<<<< HEAD
=======
  // Admin login - direct password authentication without OTP
  // Security hardened with login attempt logging
  static async adminLogin(req, res) {
    const loginAttempt = {
      email: req.body.email || 'unknown',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      timestamp: new Date(),
      success: false,
      failureReason: null
    };

    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        loginAttempt.failureReason = 'Missing credentials';
        console.log('🔐 Admin Login Attempt:', JSON.stringify(loginAttempt));
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        loginAttempt.failureReason = 'User not found';
        console.log('🔐 Admin Login Attempt:', JSON.stringify(loginAttempt));
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Only allow admin or shipping_agent roles
      if (!['admin', 'shipping_agent'].includes(user.role)) {
        loginAttempt.failureReason = `Invalid role: ${user.role}`;
        console.log('🔐 Admin Login Attempt:', JSON.stringify(loginAttempt));
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin or shipping agent account required.' 
        });
      }
      
      if (user.isLocked) {
        loginAttempt.failureReason = 'Account locked';
        console.log('🔐 Admin Login Attempt:', JSON.stringify(loginAttempt));
        return res.status(423).json({ 
          success: false, 
          message: 'Account is temporarily locked due to too many failed login attempts' 
        });
      }
      
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        loginAttempt.failureReason = 'Invalid password';
        console.log('🔐 Admin Login Attempt:', JSON.stringify(loginAttempt));
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }
      
      // Create payload for JWT - must be plain object, not Mongoose document
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      };
      
      // Generate tokens
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      
      // Update refresh token in database
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();
      
      // Log successful login
      loginAttempt.success = true;
      loginAttempt.userId = user._id;
      loginAttempt.role = user.role;
      console.log('🔐 Admin Login Attempt:', JSON.stringify(loginAttempt));
      
      const userPayload = AuthController.formatUserPayload(user);
      
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userPayload,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      loginAttempt.failureReason = `Server error: ${error.message}`;
      console.log('🔐 Admin Login Attempt:', JSON.stringify(loginAttempt));
      console.error('Admin login error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: process.env.NODE_ENV === 'development' 
          ? `Login failed: ${error.message}` 
          : 'Login failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

>>>>>>> fixed-repo/main
  // Google OAuth login initiation
  static initiateGoogleAuth(req, res, next) {
    // Store the selected role in session if provided
    const { role } = req.query;
    console.log('🎯 OAuth Initiation - Role received from query:', role);
    
    if (role && ['customer', 'artisan', 'distributor'].includes(role)) {
      req.session.selectedRole = role;
      console.log('🎯 OAuth Initiation - Role stored in session:', req.session.selectedRole);
    } else {
      req.session.selectedRole = 'customer'; // Default fallback
      console.log('🎯 OAuth Initiation - Using default role: customer');
    }
    
    const clientUrl = resolveClientUrl(req);
    req.session.oauthClientUrl = clientUrl;
    console.log('🌐 OAuth Initiation - Client URL resolved to:', clientUrl);
    
    const useHashRouting = req.query.hashRouting === '1' || req.session.useHashRouting || false;
    req.session.useHashRouting = useHashRouting;
    console.log('🌐 OAuth Initiation - Hash routing enabled:', useHashRouting);
    
    // Also include role and client URL in state parameter as fallback
    const state = JSON.stringify({ role: req.session.selectedRole, clientUrl, hashRouting: useHashRouting });
    
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: state
    })(req, res, next);
  }

  // Google OAuth callback
  static async handleGoogleCallback(req, res, next) {
    console.log('🔍 OAuth Callback - Environment check:');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 CLIENT_URL:', process.env.CLIENT_URL);
    console.log('🔍 Request URL:', req.url);
    console.log('🔍 Request query params:', req.query);
    
    const fallbackClientUrl = resolveClientUrl(req);
    const fallbackNormalizedBase = normalizeRedirectUrl(fallbackClientUrl) 
      || normalizeRedirectUrl(process.env.CLIENT_URL)
      || getClientURL()
      || 'http://localhost:5173';
    const inferredHashRouting = req.session?.useHashRouting || req.query.hashRouting === '1';

    const buildRedirectUrl = (baseCandidate, hashRouting, search = '') => {
      const normalizedBase = normalizeRedirectUrl(baseCandidate) || fallbackNormalizedBase;
      const trimmedBase = normalizedBase.replace(/\/$/, '');
      const callbackPath = hashRouting ? '/#/auth/callback' : '/auth/callback';
      return `${trimmedBase}${callbackPath}${search}`;
    };
    
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(buildRedirectUrl(fallbackClientUrl, inferredHashRouting, '?error=oauth_failed'));
      }

      if (!user) {
        return res.redirect(buildRedirectUrl(fallbackClientUrl, inferredHashRouting, '?error=oauth_denied'));
      }

      try {
        // Check if role was pre-selected during OAuth initiation
        let selectedRole = req.session?.selectedRole || 'customer';
        let clientUrl = normalizeRedirectUrl(req.session?.oauthClientUrl) || fallbackClientUrl;
        let useHashRouting = inferredHashRouting;
        
        // Also check state parameter as fallback for role and client URL
        if (req.query.state) {
          try {
            const stateData = JSON.parse(req.query.state);
            if (stateData.role) {
              selectedRole = stateData.role;
              console.log('🎯 OAuth Callback - Role found in state parameter:', selectedRole);
            }
            if (stateData.clientUrl) {
              const normalizedStateUrl = normalizeRedirectUrl(stateData.clientUrl);
              if (normalizedStateUrl) {
                clientUrl = normalizedStateUrl;
                console.log('🌐 OAuth Callback - Client URL from state:', clientUrl);
              }
            }
            if (typeof stateData.hashRouting !== 'undefined') {
              useHashRouting = !!stateData.hashRouting;
              console.log('🌐 OAuth Callback - Hash routing from state:', useHashRouting);
            }
          } catch (e) {
            console.log('🎯 OAuth Callback - Could not parse state parameter');
          }
        }

        if (!clientUrl) {
          clientUrl = fallbackClientUrl;
          console.log('🌐 OAuth Callback - Client URL resolved from fallback context:', clientUrl);
        }
        
        if (!useHashRouting && req.query.hashRouting === '1') {
          useHashRouting = true;
          console.log('🌐 OAuth Callback - Hash routing enabled via query parameter');
        }
        
        console.log('🎯 OAuth Callback - Selected Role from session:', req.session?.selectedRole);
        console.log('🎯 OAuth Callback - Final selected role:', selectedRole);
        console.log('🎯 OAuth Callback - Session object:', req.session);
        console.log('🎯 OAuth Callback - User is new:', user._isNewUser);
        console.log('🎯 OAuth Callback - Current user role:', user.role);
        console.log('🎯 OAuth Callback - Query params:', req.query);
        console.log('🌐 OAuth Callback - Hash routing enabled:', useHashRouting);
        
        // Always try to create/verify role-specific profile
        if (selectedRole === 'artisan' || selectedRole === 'distributor') {
          try {
            const defaultProfileData = {
              region: 'Default Region', // Provide a default region for artisans
              skills: [], // Empty skills array for artisans
              businessName: 'New Business', // Provide a default business name for distributors
              licenseNumber: '',
              distributionAreas: []
            };
            await AuthController.createRoleSpecificProfile(user._id, selectedRole, defaultProfileData);
          } catch (profileErr) {
            console.error('Failed to create role-specific profile:', profileErr);
            console.error('Profile error details:', profileErr.message);
            return res.redirect(buildRedirectUrl(clientUrl, useHashRouting, '?error=profile_creation_failed'));
          }
        }
        
        // Update user role if it was selected (for both new and existing users)
        console.log('🔄 About to update user role. Selected:', selectedRole, 'Current:', user.role);
        if (selectedRole && ['customer', 'artisan', 'distributor'].includes(selectedRole)) {
          if (user.role !== selectedRole) {
            console.log('🔄 Updating user role from', user.role, 'to', selectedRole);
            user.role = selectedRole;
            
            // Mark as modified to ensure save
            user.markModified('role');
            await user.save();
            
            console.log('✅ User role updated successfully. New role:', user.role);
            
            // Create role-specific profile for new users with non-customer roles
            if (user._isNewUser && (selectedRole === 'artisan' || selectedRole === 'distributor')) {
              try {
                const defaultProfileData = {
                  region: 'Default Region',
                  skills: [],
                  businessName: 'New Business', // Provide default business name for distributors
                  licenseNumber: '',
                  distributionAreas: []
                };
                await AuthController.createRoleSpecificProfile(user._id, selectedRole, defaultProfileData);
                console.log('✅ Role-specific profile created for new user');
              } catch (profileErr) {
                console.error('❌ Failed to create role-specific profile:', profileErr);
              }
            }
          } else {
            console.log('ℹ️ User role already matches selected role:', selectedRole);
          }
        } else {
          console.log('⚠️ Invalid or missing selected role, keeping current role:', user.role);
        }

        // Generate tokens with enhanced payload
        const accessToken = generateAccessToken({ 
          userId: user._id, 
          role: user.role,
          sessionId: Date.now().toString() // Include session identifier
        });
        const refreshToken = generateRefreshToken({ userId: user._id });

        // Store refresh token with metadata
        user.refreshTokens.push({ 
          token: refreshToken,
          createdAt: new Date(),
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        });
        user.lastLogin = new Date();
        await user.save();

        // Fetch fresh user data from database to ensure we have the latest role
        const freshUser = await User.findById(user._id);
        console.log('🔍 Fresh user data from DB - Role:', freshUser.role);

        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: 'strict'
        });

        // Redirect to frontend OAuth callback with token and user data
        const userData = {
          id: freshUser._id,
          name: freshUser.name,
          email: freshUser.email,
          role: freshUser.role,
          isEmailVerified: freshUser.isEmailVerified,
          isPhoneVerified: freshUser.isPhoneVerified,
          authProvider: freshUser.authProvider
        };

        console.log('🎯 Final user data being sent to frontend:', userData);
        console.log('🎯 User role before redirect:', userData.role);
        
        const callbackUrl = buildRedirectUrl(
          clientUrl,
          useHashRouting,
          `?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userData))}&role=${freshUser.role}`
        );
        console.log('🔗 Redirecting to:', callbackUrl);
        res.redirect(callbackUrl);

      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(buildRedirectUrl(fallbackClientUrl, inferredHashRouting, '?error=oauth_failed'));
      }
    })(req, res, next);
  }

  // Send OTP to email
  static async sendOTP(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
      }
      if (user.isEmailVerified) {
        return res.status(400).json({ success: false, message: 'Email is already verified' });
      }
      if (!otpService.isEmailDeliveryAvailable()) {
        return res.status(503).json({ success: false, message: 'Email delivery is unavailable. Please try again later.' });
      }
      const result = await otpService.sendOTP(email, user._id);
      res.json({
        success: true,
        message: result.message,
        data: {
          expiresAt: result.expiresAt,
          sendCount: result.sendCount,
<<<<<<< HEAD
          maxSendsPerDay: result.maxSendsPerDay
=======
          maxSendsPerDay: result.maxSendsPerDay,
          devOtpCode: result.devOtpCode
>>>>>>> fixed-repo/main
        }
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      const statusCode = error.statusCode || (error.otpDeliveryFailure ? 503 : 500);
      res.status(statusCode).json({ success: false, message: error.message || 'Failed to send OTP' });
    }
  }

  // Resend OTP to email
  static async resendOTP(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
      }
      if (user.isEmailVerified) {
        return res.status(400).json({ success: false, message: 'Email is already verified' });
      }
      if (!otpService.isEmailDeliveryAvailable()) {
        return res.status(503).json({ success: false, message: 'Email delivery is unavailable. Please try again later.' });
      }
      const result = await otpService.resendOTP(email);
      res.json({
        success: true,
        message: result.message,
        data: {
          expiresAt: result.expiresAt,
          attemptsRemaining: result.attemptsRemaining,
          dailySendCount: result.dailySendCount,
<<<<<<< HEAD
          maxSendsPerDay: result.maxSendsPerDay
=======
          maxSendsPerDay: result.maxSendsPerDay,
          devOtpCode: result.devOtpCode
>>>>>>> fixed-repo/main
        }
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      const statusCode = error.statusCode || (error.otpDeliveryFailure ? 503 : 429);
      res.status(statusCode).json({ success: false, message: error.message || 'Failed to resend OTP' });
    }
  }

  // Get OTP status for email
  static async getOTPStatus(req, res) {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }
      const status = await otpService.getOTPStatus(email);
      if (!status.exists) {
        return res.status(404).json({ success: false, message: 'User not found with this email' });
      }
      res.json({ success: true, message: 'OTP status retrieved successfully', data: status });
    } catch (error) {
      console.error('Get OTP status error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to get OTP status' });
    }
  }

  // Verify OTP for email and complete authentication
  static async verifyOTP(req, res) {
    try {
      const { email, otp, action } = req.body; // action can be 'login' or 'signup'
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const normalizedAction = action === 'login' ? 'login' : 'signup';
      const verification = await otpService.verifyOTP(email, otp, {
        skipEmailVerifiedCheck: normalizedAction === 'login'
      });
      if (!verification.success) {
        return res.status(400).json({ 
          success: false, 
          message: verification.message, 
          attemptsRemaining: verification.attemptsRemaining 
        });
      }

      // OTP verified successfully, now complete the authentication
      const accessToken = generateAccessToken({ userId: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user._id });

      // Add refresh token to user
      user.refreshTokens.push({ token: refreshToken });
      user.lastLogin = new Date();
      await user.save();

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });

      const formattedUser = AuthController.formatUserPayload(user);

      res.json({
        success: true,
        message: `Email verified and ${normalizedAction === 'login' ? 'login' : 'registration'} completed successfully`,
        data: {
          user: formattedUser,
          accessToken,
          authProvider: user.authProvider
        }
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ success: false, message: 'OTP verification failed' });
    }
  }

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not provided'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId);
      if (!user || !user.refreshTokens.find(token => token.token === refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({ userId: user._id, role: user.role });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;
      const userId = req.user?.id;

      if (userId && refreshToken) {
        // Remove refresh token from database
        await User.findByIdAndUpdate(userId, {
          $pull: { refreshTokens: { token: refreshToken } }
        });
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  // Logout from all devices
  static async logoutAll(req, res) {
    try {
      const userId = req.user.id;

      // Clear all refresh tokens
      await User.findByIdAndUpdate(userId, {
        refreshTokens: []
      });

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = req.user;
      const formattedUser = AuthController.formatUserPayload(user);

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          ...formattedUser,
          addresses: user.addresses,
          verificationDocuments: user.verificationDocuments,
          createdAt: user.createdAt
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile'
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      
      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Clear all refresh tokens to force re-login
      user.refreshTokens = [];
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully. Please log in again.'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  // Register with email and role-specific data
  static async registerWithEmail(req, res) {
    return res.status(410).json({
      success: false,
      message: 'This endpoint is disabled. Please use /api/auth/register to sign up with mandatory OTP verification.'
    });
  }

  static async rollbackFailedRegistration(userId, role) {
    try {
      if (!userId) {
        return;
      }

      await User.findByIdAndDelete(userId);

      if (role === 'artisan' || role === 'distributor') {
        const ArtisanProfile = require('../models/Artisan');
        const Distributor = require('../models/Distributor');
        const profileModel = role === 'artisan' ? ArtisanProfile : Distributor;
        await profileModel.deleteOne({ userId });
      }
    } catch (cleanupError) {
      console.error('Failed to rollback user creation after OTP failure:', cleanupError);
    }
  }

  // Helper method to create role-specific profiles
  static async createRoleSpecificProfile(userId, role, profileData) {
    const ArtisanProfile = require('../models/Artisan');
    const Distributor = require('../models/Distributor');

    try {
      if (role === 'artisan') {
        // Check if profile already exists
        const existingProfile = await ArtisanProfile.findOne({ userId });
        if (existingProfile) {
          console.log('Artisan profile already exists for user:', userId);
          return;
        }

        console.log('Creating new artisan profile for user:', userId);
        const artisanProfile = new ArtisanProfile({
          userId,
          bio: profileData.bio || '',
          region: profileData.region || 'Default Region',  // Always provide a default region
          skills: profileData.skills || []
        });
        await artisanProfile.save();
        console.log('Created artisan profile:', artisanProfile._id);
      } else if (role === 'distributor') {
        // Check if profile already exists
        const existingProfile = await Distributor.findOne({ userId });
        if (existingProfile) {
          console.log('Distributor profile already exists for user:', userId);
          return;
        }

        console.log('Creating new distributor profile for user:', userId);
        const distributorProfile = new Distributor({
          userId,
          businessName: profileData.businessName || 'New Business', // Provide default if empty
          licenseNumber: profileData.licenseNumber || '',
          distributionAreas: profileData.distributionAreas || []
        });
        await distributorProfile.save();
        console.log('Created distributor profile:', distributorProfile._id);
      }
    } catch (error) {
      console.error('Error creating role-specific profile:', error);
      throw error; // Throw error to handle it in the calling method
    }
  }
}

module.exports = AuthController;
