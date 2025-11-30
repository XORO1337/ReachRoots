const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.defaultFrom = process.env.SMTP_FROM || 'RootsReach <no-reply@rootsreach.com>';

    const hasSmtpCreds = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

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
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000
        });
        this.isConfiguredFlag = true;
        console.log('[EmailService] SMTP transporter configured successfully.');
      } catch (error) {
        console.error('[EmailService] SMTP configuration failed:', error.message);
        this.isConfiguredFlag = false;
      }
    } else {
      console.error('[EmailService] SMTP credentials are missing. Email service is not available.');
      this.isConfiguredFlag = false;
    }
  }

  isConfigured() {
    return this.isConfiguredFlag;
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
      console.log('Email sent successfully:', info.messageId);

      return { skipped: false, messageId: info.messageId };
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
