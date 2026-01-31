import nodemailer from 'nodemailer';
import type { SendEmailRequest, EmailType, OTPEmailData, ResetPasswordEmailData } from './email-templates/types';
import { getOTPEmailTemplate } from './email-templates/otp-template';
import { getResetPasswordTemplate } from './email-templates/reset-password-template';

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
      default:
        throw new Error(`Unsupported email type: ${type}`);
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: recipients?.[0] || data.recipientEmail,
      subject: emailSubject,
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
