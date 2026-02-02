export type EmailType = 'otp' | 'reset_password';

export interface BaseEmailData {
  recipientEmail: string;
  recipientName?: string;
}

export interface OTPEmailData extends BaseEmailData {
  otp: string;
  expiryMinutes?: number;
}

export interface ResetPasswordEmailData extends BaseEmailData {
  resetToken: string;
  resetUrl: string;
  expiryHours?: number;
}

export type EmailData = OTPEmailData | ResetPasswordEmailData;

export interface SendEmailRequest {
  type: EmailType;
  data: EmailData;
  subject?: string;
  recipients?: string[];
}
