// ============================================
// services/notificationService.js
// Complete Notification System
// ============================================
import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

class NotificationService {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Create and send notification
   */
  async sendNotification({ user, type, title, message, data = {}, referenceId = null, referenceModel = null }) {
    try {
      // Get user details
      const userData = await User.findById(user).select('name email phone fcmToken');
      
      if (!userData) {
        console.error('User not found:', user);
        return;
      }

      // Create notification record
      const notification = await Notification.create({
        user,
        type,
        title,
        message,
        data,
        referenceId,
        referenceModel,
        channels: {
          push: true,
          email: true,
          sms: false
        }
      });

      // Send via different channels
      const results = await Promise.allSettled([
        this.sendPushNotification(userData, notification),
        this.sendEmail(userData, notification)
      ]);

      // Update notification status
      notification.status.push.sent = results[0].status === 'fulfilled';
      notification.status.push.sentAt = results[0].status === 'fulfilled' ? new Date() : null;
      notification.status.push.error = results[0].status === 'rejected' ? results[0].reason : null;

      notification.status.email.sent = results[1].status === 'fulfilled';
      notification.status.email.sentAt = results[1].status === 'fulfilled' ? new Date() : null;
      notification.status.email.error = results[1].status === 'rejected' ? results[1].reason : null;

      await notification.save();

      return notification;
    } catch (error) {
      console.error('Notification error:', error);
      throw error;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(user, notification) {
    // Implement Firebase Cloud Messaging or your push service
    // This is a placeholder for the actual implementation
    
    if (!user.fcmToken) {
      throw new Error('No FCM token available');
    }

    // Example FCM implementation:
    /*
    const admin = require('firebase-admin');
    
    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: notification.title,
        body: notification.message
      },
      data: {
        type: notification.type,
        referenceId: notification.referenceId || '',
        ...notification.data
      }
    });
    */

    console.log('📱 Push notification sent:', notification.title);
    return true;
  }

  /**
   * Send email notification
   */
  async sendEmail(user, notification) {
    if (!user.email) {
      throw new Error('No email available');
    }

    const emailTemplate = this.getEmailTemplate(notification.type, {
      userName: user.name,
      title: notification.title,
      message: notification.message,
      ...notification.data
    });

    await this.emailTransporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: notification.title,
      html: emailTemplate
    });

    console.log('📧 Email sent:', user.email);
    return true;
  }

  /**
   * Get email template based on notification type
   */
  getEmailTemplate(type, data) {
    const baseTemplate = (content) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.APP_NAME || 'eCommerce'}</h1>
          </div>
          ${content}
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
            <p>Need help? Contact us at ${process.env.SUPPORT_EMAIL}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    switch (type) {
      case 'order_placed':
        return baseTemplate(`
          <div class="content">
            <h2>Order Placed Successfully! 🎉</h2>
            <p>Hi ${data.userName},</p>
            <p>Your order <strong>#${data.orderNo}</strong> has been placed successfully.</p>
            <div class="info-box">
              <p><strong>Order Total:</strong> ₹${data.total}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            </div>
            <a href="${process.env.APP_URL}/orders/${data.orderId}" class="button">View Order</a>
          </div>
        `);

      case 'payment_success':
        return baseTemplate(`
          <div class="content">
            <h2>Payment Successful ✅</h2>
            <p>Hi ${data.userName},</p>
            <p>Your payment for order <strong>#${data.orderNo}</strong> has been processed successfully.</p>
            <div class="info-box">
              <p><strong>Amount Paid:</strong> ₹${data.amount}</p>
              <p><strong>Payment ID:</strong> ${data.paymentId}</p>
            </div>
            <p>Your order will be shipped soon.</p>
          </div>
        `);

      case 'order_shipped':
        return baseTemplate(`
          <div class="content">
            <h2>Your Order is on the Way! 🚚</h2>
            <p>Hi ${data.userName},</p>
            <p>Great news! Your order <strong>#${data.orderNo}</strong> has been shipped.</p>
            <div class="info-box">
              <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
              <p><strong>Courier:</strong> ${data.courierName}</p>
            </div>
            <a href="${process.env.APP_URL}/orders/${data.orderId}/tracking" class="button">Track Order</a>
          </div>
        `);

      case 'order_delivered':
        return baseTemplate(`
          <div class="content">
            <h2>Order Delivered! 📦</h2>
            <p>Hi ${data.userName},</p>
            <p>Your order <strong>#${data.orderNo}</strong> has been delivered successfully.</p>
            <p>We hope you love your purchase! If you have any issues, you can return within ${data.returnWindow} days.</p>
            <a href="${process.env.APP_URL}/orders/${data.orderId}" class="button">View Order</a>
          </div>
        `);

      case 'return_approved':
        return baseTemplate(`
          <div class="content">
            <h2>Return Request Approved ✅</h2>
            <p>Hi ${data.userName},</p>
            <p>Your return request for order <strong>#${data.orderNo}</strong> has been approved.</p>
            <div class="info-box">
              <p><strong>Return ID:</strong> ${data.returnNo}</p>
              <p><strong>Refund Amount:</strong> ₹${data.refundAmount}</p>
            </div>
            <p>A pickup will be scheduled soon.</p>
          </div>
        `);

      case 'wallet_credited':
        return baseTemplate(`
          <div class="content">
            <h2>Wallet Credited! 💰</h2>
            <p>Hi ${data.userName},</p>
            <p>₹${data.amount} has been credited to your wallet.</p>
            <div class="info-box">
              <p><strong>Transaction:</strong> ${data.description}</p>
              <p><strong>New Balance:</strong> ₹${data.balance}</p>
            </div>
            <a href="${process.env.APP_URL}/wallet" class="button">View Wallet</a>
          </div>
        `);

      case 'reseller_approved':
        return baseTemplate(`
          <div class="content">
            <h2>Reseller Application Approved! 🎊</h2>
            <p>Hi ${data.userName},</p>
            <p>Congratulations! Your reseller application has been approved.</p>
            <p>You can now start adding resell prices to products and earn money on every sale.</p>
            <a href="${process.env.APP_URL}/reseller/dashboard" class="button">Go to Dashboard</a>
          </div>
        `);

      case 'withdrawal_completed':
        return baseTemplate(`
          <div class="content">
            <h2>Withdrawal Completed ✅</h2>
            <p>Hi ${data.userName},</p>
            <p>Your withdrawal request has been processed successfully.</p>
            <div class="info-box">
              <p><strong>Amount:</strong> ₹${data.amount}</p>
              <p><strong>UTR Number:</strong> ${data.utrNumber}</p>
            </div>
            <p>The amount will be credited to your bank account within 2-3 business days.</p>
          </div>
        `);

      default:
        return baseTemplate(`
          <div class="content">
            <h2>${data.title}</h2>
            <p>Hi ${data.userName},</p>
            <p>${data.message}</p>
          </div>
        `);
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(users, { type, title, message, data = {} }) {
    const notifications = [];
    
    for (const userId of users) {
      try {
        const notification = await this.sendNotification({
          user: userId,
          type,
          title,
          message,
          data
        });
        notifications.push(notification);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
      }
    }

    return notifications;
  }

  /**
   * Send order confirmation email with details
   */
  async sendOrderConfirmation(order, user) {
    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productTitle}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.finalPrice}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.itemTotal}</td>
      </tr>
    `).join('');

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 650px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #fff; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total-row { font-weight: bold; background: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Order #${order.orderNo}</p>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Thank you for your order! Here are the details:</p>
            
            <table class="order-table">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;">Subtotal:</td>
                  <td style="padding: 10px; text-align: right;">₹${order.subtotal}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;">Shipping:</td>
                  <td style="padding: 10px; text-align: right;">₹${order.shippingCost}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;">Tax:</td>
                  <td style="padding: 10px; text-align: right;">₹${order.tax}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right; font-size: 18px;">Total:</td>
                  <td style="padding: 15px; text-align: right; font-size: 18px;">₹${order.total}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background: #f0f9ff; padding: 15px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3>Shipping Address</h3>
              <p>
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.phone}<br>
                ${order.shippingAddress.addressLine1}<br>
                ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
              </p>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.APP_URL}/orders/${order._id}" 
                 style="display: inline-block; padding: 12px 30px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px;">
                Track Your Order
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailTransporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: `Order Confirmation - #${order.orderNo}`,
      html: emailContent
    });
  }
}

export default new NotificationService();
// // ============================================
// // backend/services/notificationService.js
// // ============================================
// import nodemailer from 'nodemailer';
// import admin from 'firebase-admin';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import fs from 'fs';

// // Initialize Firebase Admin (for push notifications)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// try {
//   const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
//   if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
//     const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount)
//     });
//   }
// } catch (error) {
//   console.warn('Firebase initialization skipped:', error.message);
// }

// /**
//  * Email transporter
//  */
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });

// /**
//  * Send email
//  */
// export const sendEmail = async ({ to, subject, html, text }) => {
//   try {
//     const mailOptions = {
//       from: `${process.env.SMTP_FROM_NAME || 'E-Commerce'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
//       to,
//       subject,
//       html,
//       text
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.messageId);
//     return info;
//   } catch (error) {
//     console.error('Email send error:', error);
//     throw error;
//   }
// };

// /**
//  * Send order confirmation email
//  */
// export const sendOrderConfirmationEmail = async (user, order) => {
//   const html = `
//     <h2>Order Confirmation</h2>
//     <p>Hi ${user.name},</p>
//     <p>Your order has been confirmed!</p>
//     <p><strong>Order Number:</strong> ${order.orderNo}</p>
//     <p><strong>Total Amount:</strong> ₹${order.total}</p>
//     <p>We'll send you tracking details once your order is shipped.</p>
//     <p>Thank you for shopping with us!</p>
//   `;

//   await sendEmail({
//     to: user.email,
//     subject: `Order Confirmed - ${order.orderNo}`,
//     html,
//     text: `Your order ${order.orderNo} has been confirmed. Total: ₹${order.total}`
//   });
// };

// /**
//  * Send order status update email
//  */
// export const sendOrderStatusEmail = async (user, order) => {
//   const statusMessages = {
//     confirmed: 'Your order has been confirmed',
//     packed: 'Your order has been packed',
//     shipped: 'Your order has been shipped',
//     delivered: 'Your order has been delivered',
//     cancelled: 'Your order has been cancelled'
//   };

//   const html = `
//     <h2>Order Update</h2>
//     <p>Hi ${user.name},</p>
//     <p>${statusMessages[order.orderStatus]}</p>
//     <p><strong>Order Number:</strong> ${order.orderNo}</p>
//     ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
//     <p>Thank you for shopping with us!</p>
//   `;

//   await sendEmail({
//     to: user.email,
//     subject: `Order Update - ${order.orderNo}`,
//     html,
//     text: statusMessages[order.orderStatus]
//   });
// };

// /**
//  * Send push notification
//  */
// export const sendPushNotification = async (fcmToken, { title, body, data = {} }) => {
//   try {
//     if (!admin.apps.length) {
//       console.warn('Firebase not initialized. Skipping push notification.');
//       return;
//     }

//     const message = {
//       notification: { title, body },
//       data,
//       token: fcmToken
//     };

//     const response = await admin.messaging().send(message);
//     console.log('Push notification sent:', response);
//     return response;
//   } catch (error) {
//     console.error('Push notification error:', error);
//   }
// };

// /**
//  * Send SMS (Mock - integrate with Twilio/MSG91)
//  */
// export const sendSMS = async (phone, message) => {
//   // In production, integrate with Twilio, MSG91, or other SMS provider
//   console.log(`[SMS] To: ${phone}, Message: ${message}`);
  
//   // Example Twilio integration:
//   // const twilio = require('twilio');
//   // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//   // await client.messages.create({
//   //   body: message,
//   //   from: process.env.TWILIO_PHONE_NUMBER,
//   //   to: phone
//   // });
// };
