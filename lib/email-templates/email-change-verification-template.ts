import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { EmailChangeVerificationData } from './types';

export const getEmailChangeVerificationTemplate = (data: EmailChangeVerificationData): string => {
  const { recipientName, verificationUrl, newEmail, expiryHours } = data;
  const companyName = appConfig.name;

  const content = `
    <h2>📧 Verify Your New Email Address</h2>
    <p>Hello ${recipientName || 'there'},</p>
    <p>
      You requested to change your email address on ${companyName} to 
      <strong>${newEmail}</strong>.
    </p>

    <p>Please click the button below to verify this new email address:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="button">Verify New Email</a>
    </div>

    <div class="info-box">
      <p style="margin: 0;">
        <strong>⏰ This link expires in ${expiryHours || 24} hours.</strong>
        If you did not request this change, you can safely ignore this email.
        Your account email will remain unchanged.
      </p>
    </div>

    <p style="margin-top: 20px; font-size: 13px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
    </p>

    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>The ${companyName} Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
