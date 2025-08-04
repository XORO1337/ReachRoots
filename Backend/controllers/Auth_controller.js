const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const otpService = require('../services/otpService');
const passport = require('../config/passport');

class AuthController {
  // Register with email only (OTP sent to email)
  static async registerWithEmailOTP(req, res) {
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
      await AuthController.createRoleSpecificProfile(user._id, role, { bio, region, skills, businessName, licenseNumber, distributionAreas });
      
      // Send OTP to email
      try {
        const otpResult = await otpService.sendOTP(email);
        res.status(201).json({
          success: true,
          message: 'User registered successfully. Please verify your email address with the OTP sent to your email.',
          data: {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            otpSent: true
          }
        });
      } catch (otpError) {
        console.error('OTP sending failed:', otpError);
        res.status(201).json({
          success: true,
          message: 'User registered successfully, but OTP sending failed. Please try to resend OTP.',
          data: {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            otpSent: false
          }
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ success: false, message: error.message || 'Registration failed' });
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
      
      // Send OTP to email for verification before completing login
      try {
        const otpResult = await otpService.sendOTP(email);
        res.json({
          success: true,
          message: 'Credentials verified. Please check your email for OTP to complete login.',
          data: {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isEmailVerified: user.isEmailVerified
            },
            roleChanged,
            otpSent: true,
            requiresOTP: true
          }
        });
      } catch (otpError) {
        console.error('OTP sending failed:', otpError);
        res.status(500).json({ 
          success: false, 
          message: 'Login verification failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }

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
    
    // Also include role in state parameter as fallback
    const state = JSON.stringify({ role: req.session.selectedRole });
    
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: state
    })(req, res, next);
  }

  // Google OAuth callback
  static async handleGoogleCallback(req, res, next) {
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=oauth_failed`);
      }

      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=oauth_denied`);
      }

      try {
        // Check if role was pre-selected during OAuth initiation
        let selectedRole = req.session?.selectedRole || 'customer';
        
        // Also check state parameter as fallback
        if (req.query.state) {
          try {
            const stateData = JSON.parse(req.query.state);
            if (stateData.role) {
              selectedRole = stateData.role;
              console.log('🎯 OAuth Callback - Role found in state parameter:', selectedRole);
            }
          } catch (e) {
            console.log('🎯 OAuth Callback - Could not parse state parameter');
          }
        }
        
        console.log('🎯 OAuth Callback - Selected Role from session:', req.session?.selectedRole);
        console.log('🎯 OAuth Callback - Final selected role:', selectedRole);
        console.log('🎯 OAuth Callback - Session object:', req.session);
        console.log('🎯 OAuth Callback - User is new:', user._isNewUser);
        console.log('🎯 OAuth Callback - Current user role:', user.role);
        console.log('🎯 OAuth Callback - Query params:', req.query);
        
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
            return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=profile_creation_failed`);
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
        
        const callbackUrl = `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userData))}&role=${freshUser.role}`;
        console.log('🔗 Redirecting to:', callbackUrl);
        res.redirect(callbackUrl);

      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=oauth_failed`);
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
      const result = await otpService.sendOTP(email);
      res.json({
        success: true,
        message: result.message,
        data: {
          expiresAt: result.expiresAt,
          sendCount: result.sendCount,
          maxSendsPerDay: result.maxSendsPerDay,
          otpCode: result.otpCode
        }
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
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
      const result = await otpService.resendOTP(email);
      res.json({
        success: true,
        message: result.message,
        data: {
          expiresAt: result.expiresAt,
          attemptsRemaining: result.attemptsRemaining,
          dailySendCount: result.dailySendCount,
          maxSendsPerDay: result.maxSendsPerDay,
          otpCode: result.otpCode
        }
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(429).json({ success: false, message: error.message || 'Failed to resend OTP' });
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

      const verification = await otpService.verifyOTP(email, otp);
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

      res.json({
        success: true,
        message: `Email verified and ${action === 'login' ? 'login' : 'registration'} completed successfully`,
        data: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken,
          isEmailVerified: user.isEmailVerified,
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

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          isIdentityVerified: user.isIdentityVerified,
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
    try {
      console.log('📝 Registration request received:', {
        body: req.body,
        headers: req.headers
      });
      
      const { name, email, password, phoneNumber, role, bio, region, skills, businessName, licenseNumber, distributionAreas } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email: email },
          ...(phoneNumber ? [{ phone: phoneNumber }] : [])
        ]
      });
      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
        if (existingUser.phone === phoneNumber) {
          return res.status(400).json({
            success: false,
            message: 'User with this phone number already exists'
          });
        }
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        phone: phoneNumber, // Map phoneNumber to phone
        role: role || 'customer',
        authProvider: 'local',
        isEmailVerified: false,
        isPhoneVerified: false
      });

      await user.save();

      // Create role-specific profile
      await AuthController.createRoleSpecificProfile(user._id, role, {
        bio,
        region,
        skills,
        businessName,
        licenseNumber,
        distributionAreas
      });

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user._id });

      // Store refresh token
      user.refreshTokens.push({ token: refreshToken });
      user.lastLogin = new Date();
      await user.save();

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          accessToken,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified
        }
      });

    } catch (error) {
      console.error('Email registration error:', error);
      // Send a more detailed error response
      res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: {
          message: error.message,
          type: error.name,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
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
