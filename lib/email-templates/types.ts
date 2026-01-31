export enum EmailType {
  OTP = 'otp',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  RESET_PASSWORD = 'reset_password',
  CONTACT_FORM = 'contact_form',
  BOOKING_UPDATE = 'booking_update',
  WELCOME = 'welcome',
  PAYMENT_RECEIPT = 'payment_receipt',
}

export interface BaseEmailData {
  recipientEmail: string;
  recipientName?: string;
}

export interface OTPEmailData extends BaseEmailData {
  otp: string;
  expiryMinutes?: number;
}

export interface BookingConfirmationEmailData extends BaseEmailData {
  bookingId: string;
  activityName: string;
  bookingDate: string;
  numberOfPeople: number | string;
  totalAmount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface ResetPasswordEmailData extends BaseEmailData {
  resetToken: string;
  resetUrl: string;
  expiryHours?: number;
}

export interface ContactFormEmailData extends BaseEmailData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  message: string;
}

export interface BookingUpdateEmailData extends BaseEmailData {
  bookingId: string;
  activityName: string;
  status: string;
  updateMessage: string;
}

export interface WelcomeEmailData extends BaseEmailData {
  userName: string;
}

export interface PaymentReceiptEmailData extends BaseEmailData {
  transactionId: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  description: string;
}

export type EmailData =
  | OTPEmailData
  | BookingConfirmationEmailData
  | ResetPasswordEmailData
  | ContactFormEmailData
  | BookingUpdateEmailData
  | WelcomeEmailData
  | PaymentReceiptEmailData;

export interface SendEmailRequest {
  type: EmailType;
  data: EmailData;
  subject?: string;
  recipients?: string[];
}
