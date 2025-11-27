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

  /**
   * Send order status update email to buyer
   * @param {Object} options - Email options
   * @param {string} options.email - Buyer email address
   * @param {string} options.name - Buyer name
   * @param {string} options.orderId - Order ID
   * @param {string} options.orderNumber - Order number for display
   * @param {string} options.status - New order status
   * @param {string} options.note - Optional note about the status change
   */
  async sendOrderStatusUpdateEmail({ email, name, orderId, orderNumber, status, note }) {
    try {
      if (!this.transporter) {
        console.warn('[EmailService] Cannot send order status email - transporter not configured');
        return { skipped: true };
      }

      const statusMessages = {
        received: 'Your order has been received and is being prepared.',
        processing: 'Your order is now being processed.',
        packed: 'Great news! Your order has been packed and is ready for shipping.',
        pickup_requested: 'A pickup agent has been requested. Your order will be shipped soon.',
        shipped: 'Your order has been shipped and is on its way!',
        in_transit: 'Your order is in transit.',
        out_for_delivery: 'Your order is out for delivery today!',
        delivered: 'Your order has been delivered. Thank you for shopping with us!',
        cancelled: 'Your order has been cancelled.',
        returned: 'Your order return has been processed.'
      };

      const statusColors = {
        received: '#f59e0b',
        processing: '#3b82f6',
        packed: '#6366f1',
        pickup_requested: '#8b5cf6',
        shipped: '#06b6d4',
        in_transit: '#14b8a6',
        out_for_delivery: '#84cc16',
        delivered: '#22c55e',
        cancelled: '#ef4444',
        returned: '#6b7280'
      };

      const statusColor = statusColors[status] || '#6b7280';
      const statusMessage = statusMessages[status] || `Your order status has been updated to: ${status}`;
      const displayOrderId = orderNumber || orderId.slice(-8).toUpperCase();

      const mailOptions = {
        from: this.defaultFrom,
        to: email,
        subject: `Order #${displayOrderId} - Status Update: ${status.replace(/_/g, ' ').toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">RootsReach</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
              
              <div style="background-color: ${statusColor}; color: white; padding: 15px 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order Status</p>
                <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; text-transform: uppercase;">${status.replace(/_/g, ' ')}</p>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">${statusMessage}</p>
              
              ${note ? `
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #666; font-size: 14px;"><strong>Note from seller:</strong></p>
                <p style="margin: 10px 0 0 0; color: #333;">${note}</p>
              </div>
              ` : ''}
              
              <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-top: 20px;">
                <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">ORDER DETAILS</p>
                <p style="margin: 0; color: #333; font-weight: bold;">Order #${displayOrderId}</p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" 
                   style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  View Order Details
                </a>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #888; font-size: 12px;">
              <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
              <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} RootsReach. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (this.usingConsoleTransport) {
        console.log(`\n[EmailService][Console] Order status email to ${email}:\n[Order #${displayOrderId}] Status: ${status}\n`);
      } else {
        console.log('Order status email sent successfully:', info.messageId);
      }

      return { skipped: false, messageId: info.messageId || 'dev-console' };
    } catch (error) {
      console.error('Error sending order status email:', error);
      // Don't throw - email failure shouldn't break order status updates
      return { skipped: true, error: error.message };
    }
  }

  /**
   * Send order shipped email with tracking details
   * @param {Object} options - Email options
   */
  async sendOrderShippedEmail({ email, name, orderId, orderNumber, carrier, trackingNumber, estimatedDelivery }) {
    try {
      if (!this.transporter) {
        console.warn('[EmailService] Cannot send shipped email - transporter not configured');
        return { skipped: true };
      }

      const displayOrderId = orderNumber || orderId.slice(-8).toUpperCase();

      const mailOptions = {
        from: this.defaultFrom,
        to: email,
        subject: `Order #${displayOrderId} has been shipped! 🚚`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">RootsReach</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
              
              <div style="background-color: #06b6d4; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 24px;">📦 Your order is on its way!</p>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Great news! Your order has been shipped and is on its way to you.
              </p>
              
              <div style="border: 1px solid #eee; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Shipping Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #888; width: 40%;">Order Number:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold;">#${displayOrderId}</td>
                  </tr>
                  ${carrier ? `
                  <tr>
                    <td style="padding: 8px 0; color: #888;">Carrier:</td>
                    <td style="padding: 8px 0; color: #333;">${carrier}</td>
                  </tr>
                  ` : ''}
                  ${trackingNumber ? `
                  <tr>
                    <td style="padding: 8px 0; color: #888;">Tracking Number:</td>
                    <td style="padding: 8px 0; color: #333; font-family: monospace; font-size: 14px;">${trackingNumber}</td>
                  </tr>
                  ` : ''}
                  ${estimatedDelivery ? `
                  <tr>
                    <td style="padding: 8px 0; color: #888;">Estimated Delivery:</td>
                    <td style="padding: 8px 0; color: #333;">${new Date(estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" 
                   style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Track Your Order
                </a>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #888; font-size: 12px;">
              <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
              <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} RootsReach. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (this.usingConsoleTransport) {
        console.log(`\n[EmailService][Console] Shipped email to ${email}:\n[Order #${displayOrderId}] Carrier: ${carrier || 'N/A'}, Tracking: ${trackingNumber || 'N/A'}\n`);
      } else {
        console.log('Shipped email sent successfully:', info.messageId);
      }

      return { skipped: false, messageId: info.messageId || 'dev-console' };
    } catch (error) {
      console.error('Error sending shipped email:', error);
      return { skipped: true, error: error.message };
    }
  }

  /**
   * Send order delivered confirmation email
   * @param {Object} options - Email options
   */
  async sendOrderDeliveredEmail({ email, name, orderId, orderNumber }) {
    try {
      if (!this.transporter) {
        console.warn('[EmailService] Cannot send delivered email - transporter not configured');
        return { skipped: true };
      }

      const displayOrderId = orderNumber || orderId.slice(-8).toUpperCase();

      const mailOptions = {
        from: this.defaultFrom,
        to: email,
        subject: `Order #${displayOrderId} has been delivered! ✅`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">RootsReach</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
              
              <div style="background-color: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 24px;">✅ Your order has been delivered!</p>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your order <strong>#${displayOrderId}</strong> has been successfully delivered. 
                We hope you enjoy your purchase!
              </p>
              
              <div style="background-color: #fff7ed; border: 1px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Enjoyed your purchase?</p>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Consider leaving a review to help other customers and support our artisans!
                </p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" 
                   style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">
                  View Order
                </a>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #888; font-size: 12px;">
              <p style="margin: 0;">Thank you for shopping with RootsReach!</p>
              <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} RootsReach. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (this.usingConsoleTransport) {
        console.log(`\n[EmailService][Console] Delivered email to ${email}:\n[Order #${displayOrderId}] Delivered successfully\n`);
      } else {
        console.log('Delivered email sent successfully:', info.messageId);
      }

      return { skipped: false, messageId: info.messageId || 'dev-console' };
    } catch (error) {
      console.error('Error sending delivered email:', error);
      return { skipped: true, error: error.message };
    }
  }

  /**
   * Send pickup request notification to artisan
   * @param {Object} options - Email options
   */
  async sendPickupRequestedEmail({ email, name, orderId, orderNumber, pickupAddress }) {
    try {
      if (!this.transporter) {
        console.warn('[EmailService] Cannot send pickup request email - transporter not configured');
        return { skipped: true };
      }

      const displayOrderId = orderNumber || orderId.slice(-8).toUpperCase();

      const mailOptions = {
        from: this.defaultFrom,
        to: email,
        subject: `Pickup Agent Requested for Order #${displayOrderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">RootsReach</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
              
              <div style="background-color: #8b5cf6; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 20px;">🚛 Pickup Agent Requested</p>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                A pickup agent has been requested for order <strong>#${displayOrderId}</strong>.
                Please ensure the order is packed and ready for pickup.
              </p>
              
              ${pickupAddress ? `
              <div style="border: 1px solid #eee; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Pickup Location</h3>
                <p style="margin: 0; color: #666; line-height: 1.6;">${pickupAddress}</p>
              </div>
              ` : ''}
              
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Note:</strong> The pickup agent will contact you shortly to confirm the pickup time.
                </p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/artisan/orders" 
                   style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  View Order Details
                </a>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #888; font-size: 12px;">
              <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
              <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} RootsReach. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (this.usingConsoleTransport) {
        console.log(`\n[EmailService][Console] Pickup request email to ${email}:\n[Order #${displayOrderId}] Pickup agent requested\n`);
      } else {
        console.log('Pickup request email sent successfully:', info.messageId);
      }

      return { skipped: false, messageId: info.messageId || 'dev-console' };
    } catch (error) {
      console.error('Error sending pickup request email:', error);
      return { skipped: true, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
