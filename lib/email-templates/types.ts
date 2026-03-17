export type EmailType = 'otp' | 'reset_password' | 'payment_receipt' | 'welcome' | 'subscription_created' | 'subscription_cancelled';

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

export interface WelcomeEmailData extends BaseEmailData {
  userName: string;
}

export interface PaymentReceiptEmailData extends BaseEmailData {
  transactionId?: string;
  invoiceId?: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  description?: string;
}

export interface SubscriptionEmailData extends BaseEmailData {
  planName?: string;
  currentPeriodEnd?: string;
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

export type EmailData = OTPEmailData | ResetPasswordEmailData | PaymentReceiptEmailData | WelcomeEmailData | SubscriptionEmailData;

export interface SendEmailRequest {
  type: EmailType;
  data: EmailData;
  subject?: string;
  recipients?: string[];
}
