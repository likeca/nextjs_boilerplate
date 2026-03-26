import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { EmailChangeNotificationData } from './types';

export const getEmailChangeNotificationTemplate = (data: EmailChangeNotificationData): string => {
  const { recipientName, newEmail } = data;
  const companyName = appConfig.name;

  const content = `
    <h2>🔔 Email Change Requested</h2>
    <p>Hello ${recipientName || 'there'},</p>
    <p>
      We received a request to change the email address associated with your 
      ${companyName} account to <strong>${newEmail}</strong>.
    </p>

    <div style="background-color: #fef3c7; padding: 15px 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0;">
        <strong>⚠️ If you did not request this change</strong>, please secure your account 
        immediately by changing your password and contacting our support team at 
        <a href="mailto:${appConfig.supportEmail}" style="color: #3b82f6;">${appConfig.supportEmail}</a>.
      </p>
    </div>

    <p>
      A verification email has been sent to the new address. Your email will 
      <strong>not be changed</strong> until the new address is verified.
    </p>

    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>The ${companyName} Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
