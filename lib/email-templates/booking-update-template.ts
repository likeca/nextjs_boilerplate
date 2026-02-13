import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { BookingUpdateEmailData } from './types';

export const getBookingUpdateTemplate = (data: BookingUpdateEmailData): string => {
  const { recipientName, bookingId, activityName, status, updateMessage } = data;
  const companyName = appConfig.name;

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('confirmed')) return '#28a745';
    if (statusLower.includes('cancelled')) return '#dc3545';
    if (statusLower.includes('pending')) return '#ffc107';
    if (statusLower.includes('completed')) return '#17a2b8';
    return '#6c757d';
  };

  const statusColor = getStatusColor(status);

  const content = `
    <h2>📋 Booking Update</h2>
    <p>Hello ${recipientName ? recipientName : 'there'},</p>
    <p>We have an update regarding your booking with ${companyName}.</p>
    
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
        <span class="info-label">Status:</span>
        <span class="info-value">
          <strong style="color: ${statusColor}; text-transform: uppercase;">${status}</strong>
        </span>
      </div>
    </div>

    <div style="background-color: #e7f5ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #1e40af;">Update Details:</h3>
      <p style="margin: 0; white-space: pre-wrap;">${updateMessage}</p>
    </div>

    <a href="${appConfig.url}/bookings/${bookingId}" class="button">View Booking Details</a>

    <p style="margin-top: 30px;">
      If you have any questions about this update, please don't hesitate to contact us at 
      <a href="mailto:${process.env.SMTP_FROM_EMAIL || 'support@example.com'}" style="color: #3b82f6;">${process.env.SMTP_FROM_EMAIL || 'support@example.com'}</a>
    </p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>${companyName} Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
