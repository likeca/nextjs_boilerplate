import { getBaseEmailTemplate } from './base-template';
import type { ResetPasswordEmailData } from './types';

export const getResetPasswordTemplate = (data: ResetPasswordEmailData): string => {
  const { recipientName, resetUrl, expiryHours = 1 } = data;

  const content = `
    <h2>🔒 Reset Your Password</h2>
    <p>Hello ${recipientName ? recipientName : 'there'},</p>
    <p>We received a request to reset your password for your Centourism account.</p>
    
    <p>Click the button below to create a new password:</p>
    
    <a href="${resetUrl}" class="button">Reset Password</a>
    
    <div class="info-box">
      <p style="margin: 0; color: #dc3545;">
        <strong>⚠️ Important:</strong> This link will expire in ${expiryHours} hour${expiryHours > 1 ? 's' : ''}.
      </p>
    </div>

    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #3b82f6; font-size: 14px;">
      ${resetUrl}
    </p>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404;">
        <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
      </p>
    </div>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>Centourism Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
