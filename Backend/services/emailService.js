const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.usingConsoleTransport = false;
    this.transporter = null;
    this.defaultFrom = process.env.SMTP_FROM || 'RootsReach <no-reply@rootsreach.com>';

    const hasSmtpCreds = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    // Try to use real SMTP if credentials are available
    if (hasSmtpCreds) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          // Add connection timeout to prevent hanging
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 10000,
          socketTimeout: 10000
        });

        // Test the connection immediately
        this.transporter.verify((error, success) => {
          if (error) {
            console.warn('[EmailService] SMTP verification failed, falling back to console transport:', error.message);
            this.fallbackToConsoleTransport('SMTP verification failed');
          } else {
            console.log('[EmailService] SMTP transporter configured and verified.');
            this.isConfiguredFlag = true;
          }
        });
        return;
      } catch (error) {
        console.warn('[EmailService] SMTP configuration failed, falling back to console transport:', error.message);
        this.fallbackToConsoleTransport('SMTP configuration error');
        return;
      }
    }

    // No SMTP credentials - use console transport
    this.fallbackToConsoleTransport('SMTP credentials missing');
  }

  fallbackToConsoleTransport(reason) {
    this.transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
    this.isConfiguredFlag = true;
    this.usingConsoleTransport = true;
    console.warn(`[EmailService] Using console transport (${reason}). OTP emails will be logged to the server console.`);
  }

  shouldEnableConsoleTransport() {
    // This method is deprecated - console transport is now the default
    return true;
  }

  isConfigured() {
    return this.isConfiguredFlag;
  }

  usesConsoleTransport() {
    return this.usingConsoleTransport;
  }

  /**
   * Send OTP email to user
   * @param {string} email - Recipient email address
   * @param {string} otp - One-time password
   * @param {string} name - Recipient's name
   */
  async sendOTPEmail(email, otp, name) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter is not configured.');
      }

      const mailOptions = {
        from: this.defaultFrom, // Sender Address
        to: email,
        subject: 'Your OTP for RootsReach',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hello ${name},</h2>
            <p>Your one-time password (OTP) for RootsReach verification is:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} RootsReach. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (this.usingConsoleTransport) {
        const preview = info.message ? info.message.toString() : '(no preview available)';
        console.log(`\n[EmailService][Console] OTP email to ${email}:\n${preview}\n`);
      } else {
        console.log('Email sent successfully:', info.messageId);
      }

      return { skipped: false, messageId: info.messageId || 'dev-console' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Test email connection
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        console.warn('[EmailService] Cannot verify transporter because it is not configured.');
        return false;
      }

      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
