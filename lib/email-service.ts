import nodemailer from 'nodemailer';
import type { SendEmailRequest, OTPEmailData, ResetPasswordEmailData, PaymentReceiptEmailData, WelcomeEmailData, SubscriptionEmailData } from './email-templates/types';
import { getOTPEmailTemplate } from './email-templates/otp-template';
import { getResetPasswordTemplate } from './email-templates/reset-password-template';
import { getPaymentReceiptTemplate } from './email-templates/payment-receipt-template';
import { getWelcomeEmailTemplate } from './email-templates/welcome-template';
import { getSubscriptionEmailTemplate } from './email-templates/subscription-template';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(request: SendEmailRequest): Promise<void> {
    const { type, data, recipients, subject } = request;
    
    let htmlContent: string;
    let emailSubject: string;

    switch (type) {
      case 'otp':
        htmlContent = getOTPEmailTemplate(data as OTPEmailData);
        emailSubject = subject || 'Your Verification Code';
        break;
      case 'reset_password':
        htmlContent = getResetPasswordTemplate(data as ResetPasswordEmailData);
        emailSubject = subject || 'Reset Your Password';
        break;
      case 'payment_receipt': {
        const receiptData = data as PaymentReceiptEmailData;
        const normalizedReceipt = {
          ...receiptData,
          transactionId: receiptData.transactionId || receiptData.invoiceId || '',
        };
        htmlContent = getPaymentReceiptTemplate(normalizedReceipt);
        emailSubject = subject || 'Payment Receipt';
        break;
      }
      case 'welcome':
        htmlContent = getWelcomeEmailTemplate(data as WelcomeEmailData);
        emailSubject = subject || 'Welcome!';
        break;
      case 'subscription_created':
        htmlContent = getSubscriptionEmailTemplate(data as SubscriptionEmailData, 'created');
        emailSubject = subject || 'Subscription Confirmed';
        break;
      case 'subscription_cancelled':
        htmlContent = getSubscriptionEmailTemplate(data as SubscriptionEmailData, 'cancelled');
        emailSubject = subject || 'Subscription Cancelled';
        break;
      default:
        throw new Error(`Unsupported email type: ${type}`);
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: recipients?.[0] || (data as any).recipientEmail,
      subject: emailSubject,
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
