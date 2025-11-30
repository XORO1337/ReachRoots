const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('./emailService');

const buildOtpDeliveryError = (message) => {
  const error = new Error(message);
  error.code = 'OTP_DELIVERY_FAILED';
  error.statusCode = 503;
  error.otpDeliveryFailure = true;
  return error;
};

const shouldExposeDevOtp = () => {
  // Dev OTP codes are no longer exposed for security reasons
  // Users must check their email for the OTP
  return false;
};class OTPService {
  constructor() {
    this.OTP_LENGTH = 6;
    this.OTP_EXPIRY_MINUTES = 10;
    this.MAX_RESEND_ATTEMPTS = 5;
    this.RESEND_COOLDOWN_MINUTES = 1;
    this.MAX_VERIFICATION_ATTEMPTS = 5;
    this.LOCKOUT_DURATION_MINUTES = 30;
    this.MAX_DAILY_SENDS = 10;
  }

  isEmailDeliveryAvailable() {
    return emailService.isConfigured();
  }

  generateOTP() {
    const buffer = crypto.randomBytes(3);
    return (parseInt(buffer.toString('hex'), 16) % 900000 + 100000).toString();
  }

  async sendOTP(email, userId = null) {
    try {
      const currentTime = new Date();
      const user = userId ? await User.findById(userId) : await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.otpLockUntil && user.otpLockUntil > currentTime) {
        const lockTimeRemaining = Math.ceil((user.otpLockUntil - currentTime) / (1000 * 60));
        throw new Error(`Account is locked due to too many failed attempts. Please try again in ${lockTimeRemaining} minutes.`);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!user.lastOtpSentDate || user.lastOtpSentDate < today) {
        user.otpSendCount = 0;
        user.lastOtpSentDate = today;
      }

      const nextSendCount = (user.otpSendCount || 0) + 1;
      if (nextSendCount > this.MAX_DAILY_SENDS) {
        throw new Error(`Daily OTP limit (${this.MAX_DAILY_SENDS}) reached. Please try again tomorrow.`);
      }

      if (!this.isEmailDeliveryAvailable()) {
        throw buildOtpDeliveryError('Email delivery service is not configured. Unable to send verification code.');
      }

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      try {
        await emailService.sendOTPEmail(email, otp, user.name);
      } catch (error) {
        console.error('Error sending OTP email:', error);
        throw buildOtpDeliveryError('Failed to send verification code. Please try again later.');
      }

      await User.findByIdAndUpdate(user._id, {
        otpCode: otp,
        otpExpires: expiresAt,
        otpAttempts: 0,
        lastOtpSentAt: currentTime,
        otpSendCount: nextSendCount,
        lastOtpSentDate: today,
        $unset: { otpLockUntil: 1 }
      });

      console.log(`OTP generated and sent to ${email}.`);

      return {
        success: true,
        message: 'OTP sent successfully to your email address.',
        emailSent: true,
        expiresAt,
        sendCount: nextSendCount,
        maxSendsPerDay: this.MAX_DAILY_SENDS
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  async resendOTP(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      if (user.isEmailVerified) throw new Error('Email is already verified');

      const currentTime = new Date();
      if (user.otpLockUntil && user.otpLockUntil > currentTime) {
        const lockTimeRemaining = Math.ceil((user.otpLockUntil - currentTime) / (1000 * 60));
        throw new Error(`Account is locked due to too many failed attempts. Please try again in ${lockTimeRemaining} minutes.`);
      }

      if (user.lastOtpSentAt) {
        const cooldownEndTime = new Date(user.lastOtpSentAt.getTime() + this.RESEND_COOLDOWN_MINUTES * 60 * 1000);
        if (currentTime < cooldownEndTime) {
          const remainingTime = Math.ceil((cooldownEndTime - currentTime) / 1000);
          throw new Error(`Please wait ${remainingTime} seconds before requesting another OTP`);
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!user.lastOtpSentDate || user.lastOtpSentDate < today) {
        user.otpSendCount = 0;
        user.lastOtpSentDate = today;
      }

      if (!user.otpResendCount || user.lastResendDate < today) {
        user.otpResendCount = 0;
        user.lastResendDate = today;
      }

      const nextSendCount = (user.otpSendCount || 0) + 1;
      const nextResendCount = (user.otpResendCount || 0) + 1;

      if (nextSendCount > this.MAX_DAILY_SENDS) {
        throw new Error(`Daily OTP limit (${this.MAX_DAILY_SENDS}) reached. Please try again tomorrow.`);
      }

      if (nextResendCount > this.MAX_RESEND_ATTEMPTS) {
        throw new Error(`Maximum resend attempts (${this.MAX_RESEND_ATTEMPTS}) reached for today. Please try again tomorrow.`);
      }

      if (!this.isEmailDeliveryAvailable()) {
        throw buildOtpDeliveryError('Email delivery service is not configured. Unable to resend verification code.');
      }

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      try {
        await emailService.sendOTPEmail(user.email, otp, user.name);
      } catch (error) {
        console.error('Error resending OTP email:', error);
        throw buildOtpDeliveryError('Failed to resend verification code. Please try again later.');
      }

      await User.findByIdAndUpdate(user._id, {
        otpCode: otp,
        otpExpires: expiresAt,
        otpAttempts: 0,
        lastOtpSentAt: currentTime,
        otpResendCount: nextResendCount,
        lastResendDate: today,
        otpSendCount: nextSendCount,
        lastOtpSentDate: today,
        $unset: { otpLockUntil: 1 }
      });

      console.log(`OTP resent for ${user.email}.`);

      return {
        success: true,
        message: 'OTP resent successfully.',
        emailSent: true,
        expiresAt,
        attemptsRemaining: this.MAX_RESEND_ATTEMPTS - nextResendCount,
        dailySendCount: nextSendCount,
        maxSendsPerDay: this.MAX_DAILY_SENDS
      };
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  }

  async verifyOTP(email, otpCode, options = {}) {
    try {
      const { skipEmailVerifiedCheck = false } = options;
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isEmailVerified && !skipEmailVerifiedCheck) {
        return { success: false, message: 'Email is already verified' };
      }

      const currentTime = new Date();

      if (user.otpLockUntil && user.otpLockUntil > currentTime) {
        const lockTimeRemaining = Math.ceil((user.otpLockUntil - currentTime) / (1000 * 60));
        return { success: false, message: `Account is locked due to too many failed attempts. Please try again in ${lockTimeRemaining} minutes.` };
      }

      if (!user.otpCode || !user.otpExpires) {
        return { success: false, message: 'No OTP found. Please request a new one.' };
      }

      if (user.otpExpires < currentTime) {
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      if (user.otpAttempts >= this.MAX_VERIFICATION_ATTEMPTS) {
        const lockUntil = new Date(currentTime.getTime() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000);
        await User.findByIdAndUpdate(user._id, {
          otpLockUntil: lockUntil,
          $unset: { otpCode: 1, otpExpires: 1, otpAttempts: 1 }
        });
        return { success: false, message: `Too many invalid attempts. Account locked for ${this.LOCKOUT_DURATION_MINUTES} minutes.` };
      }

      if (user.otpCode !== otpCode) {
        await User.findByIdAndUpdate(user._id, { $inc: { otpAttempts: 1 } });
        const attemptsRemaining = this.MAX_VERIFICATION_ATTEMPTS - (user.otpAttempts + 1);
        return { success: false, message: `Invalid OTP. ${attemptsRemaining} attempts remaining.`, attemptsRemaining };
      }

      await User.findByIdAndUpdate(user._id, {
        $unset: {
          otpCode: 1,
          otpExpires: 1,
          otpAttempts: 1,
          otpResendCount: 1,
          lastOtpSentAt: 1,
          lastResendDate: 1,
          otpSendCount: 1,
          lastOtpSentDate: 1,
          otpLockUntil: 1
        },
        isEmailVerified: true,
        emailVerifiedAt: currentTime
      });

      console.log(`OTP verified successfully for ${email}`);
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'OTP verification failed. Please try again.' };
    }
  }

  async getOTPStatus(email) {
    try {
      const user = await User.findOne({ email })
        .select('otpCode otpExpires otpAttempts lastOtpSentAt otpResendCount lastResendDate otpSendCount lastOtpSentDate isEmailVerified otpLockUntil emailVerifiedAt');

      if (!user) return { exists: false };

      const now = new Date();
      const hasActiveOTP = user.otpCode && user.otpExpires && user.otpExpires > now;

      let canResend = true;
      let cooldownRemaining = 0;
      let isLocked = false;
      let lockTimeRemaining = 0;

      if (user.otpLockUntil && user.otpLockUntil > now) {
        isLocked = true;
        lockTimeRemaining = Math.ceil((user.otpLockUntil - now) / (1000 * 60));
        canResend = false;
      }

      if (user.lastOtpSentAt && !isLocked) {
        const cooldownEndTime = new Date(user.lastOtpSentAt.getTime() + this.RESEND_COOLDOWN_MINUTES * 60 * 1000);
        if (now < cooldownEndTime) {
          canResend = false;
          cooldownRemaining = Math.ceil((cooldownEndTime - now) / 1000);
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dailySendCount = (user.lastOtpSentDate && user.lastOtpSentDate >= today) ? (user.otpSendCount || 0) : 0;
      const dailyLimitReached = dailySendCount >= this.MAX_DAILY_SENDS;

      if (dailyLimitReached) canResend = false;

      return {
        exists: true,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        hasActiveOTP,
        otpExpires: user.otpExpires,
        attemptsUsed: user.otpAttempts || 0,
        maxAttempts: this.MAX_VERIFICATION_ATTEMPTS,
        isLocked,
        lockTimeRemaining,
        canResend,
        cooldownRemaining,
        resendCount: user.otpResendCount || 0,
        maxResends: this.MAX_RESEND_ATTEMPTS,
        dailySendCount,
        maxDailySends: this.MAX_DAILY_SENDS,
        dailyLimitReached
      };
    } catch (error) {
      console.error('Error getting OTP status:', error);
      throw new Error('Failed to get OTP status');
    }
  }

  async cleanupExpiredOTPs() {
    try {
      const currentTime = new Date();

      const expiredOtpResult = await User.updateMany(
        { otpExpires: { $lt: currentTime } },
        {
          $unset: {
            otpCode: 1,
            otpExpires: 1,
            otpAttempts: 1
          }
        }
      );

      const expiredLockResult = await User.updateMany(
        { otpLockUntil: { $lt: currentTime } },
        {
          $unset: { otpLockUntil: 1 }
        }
      );

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const dailyResetResult = await User.updateMany(
        { lastOtpSentDate: { $lt: yesterday } },
        {
          $unset: {
            otpSendCount: 1,
            lastOtpSentDate: 1,
            otpResendCount: 1,
            lastResendDate: 1
          }
        }
      );

      return {
        expiredOTPs: expiredOtpResult.modifiedCount,
        expiredLocks: expiredLockResult.modifiedCount,
        dailyResets: dailyResetResult.modifiedCount
      };
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      throw error;
    }
  }

  async getOTPStatistics() {
    try {
      const currentTime = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsersWithActiveOTP: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$otpCode', null] },
                      { $gt: ['$otpExpires', currentTime] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            totalVerifiedEmails: {
              $sum: { $cond: ['$isEmailVerified', 1, 0] }
            },
            totalLockedAccounts: {
              $sum: {
                $cond: [
                  { $gt: ['$otpLockUntil', currentTime] },
                  1,
                  0
                ]
              }
            },
            dailyOTPsSent: {
              $sum: {
                $cond: [
                  { $gte: ['$lastOtpSentDate', today] },
                  { $ifNull: ['$otpSendCount', 0] },
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats[0] || {
        totalUsersWithActiveOTP: 0,
        totalVerifiedEmails: 0,
        totalLockedAccounts: 0,
        dailyOTPsSent: 0
      };
    } catch (error) {
      console.error('Error getting OTP statistics:', error);
      throw error;
    }
  }
}

module.exports = new OTPService();
