import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { BookingConfirmationEmailData } from './types';

export const getBookingConfirmationTemplate = (data: BookingConfirmationEmailData): string => {
  const {
    bookingId,
    activityName,
    bookingDate,
    numberOfPeople,
    totalAmount,
    currency = 'AED',
    customerName,
    customerEmail,
    customerPhone,
  } = data;
  const companyName = appConfig.name;

  const content = `
    <h2>🎉 Booking Confirmation</h2>
    <p>Hello ${customerName},</p>
    <p>Thank you for choosing ${companyName}! Your booking has been confirmed.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Booking ID:</span>
        <span class="info-value">#${bookingId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Activity:</span>
        <span class="info-value">${activityName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date & Time:</span>
        <span class="info-value">${bookingDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Number of People:</span>
        <span class="info-value">${numberOfPeople}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Amount:</span>
        <span class="info-value" style="font-size: 18px; font-weight: bold; color: #1e40af;">
          ${totalAmount.toFixed(2)} ${currency}
        </span>
      </div>
    </div>

    <div style="background-color: #e7f5ff; padding: 15px 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">Customer Information</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
      ${customerPhone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${customerPhone}</p>` : ''}
    </div>

    <p style="margin-top: 25px;">
      <strong>What's Next?</strong>
    </p>
    <ul style="line-height: 1.8;">
      <li>We'll send you a reminder 24 hours before your activity</li>
      <li>Please arrive 15 minutes before your scheduled time</li>
      <li>Bring a valid ID and this confirmation email</li>
    </ul>

    <a href="${appConfig.url}/bookings/${bookingId}" class="button">View Booking Details</a>

    <p style="margin-top: 30px;">
      If you have any questions, feel free to contact us at <a href="mailto:${process.env.SMTP_FROM_EMAIL || 'support@example.com'}">${process.env.SMTP_FROM_EMAIL || 'support@example.com'}</a>
    </p>
    
    <p style="margin-top: 30px;">
      We look forward to seeing you!<br>
      <strong>${companyName} Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
