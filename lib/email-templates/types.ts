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

export interface WelcomeEmailData {
  userName: string;
}

export interface PaymentReceiptEmailData {
  recipientName?: string;
  transactionId: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  description?: string;
}

export interface BookingUpdateEmailData {
  recipientName?: string;
  bookingId: string;
  activityName: string;
  status: string;
  updateMessage: string;
}

export interface ContactFormEmailData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  message: string;
}

export interface BookingConfirmationEmailData {
  bookingId: string;
  activityName: string;
  bookingDate: string;
  numberOfPeople: number;
  totalAmount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export type EmailData = OTPEmailData | ResetPasswordEmailData;

export interface SendEmailRequest {
  type: EmailType;
  data: EmailData;
  subject?: string;
  recipients?: string[];
}
