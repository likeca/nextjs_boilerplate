import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { OTPEmailData } from './types';

export const getOTPEmailTemplate = (data: OTPEmailData): string => {
  const { recipientName, otp, expiryMinutes = 10 } = data;
  const companyName = appConfig.company.name;

  const content = `
    <h2>Verify Your Account</h2>
    <p>Hello ${recipientName ? recipientName : 'there'},</p>
    <p>You have requested a One-Time Password (OTP) to verify your account. Please use the code below:</p>
    
    <div class="otp-code">${otp}</div>
    
    <div class="info-box">
      <p style="margin: 0; color: #dc3545;">
        <strong>⚠️ Important:</strong> This code will expire in ${expiryMinutes} minutes.
      </p>
    </div>
    
    <p>If you did not request this code, please ignore this email or contact our support team if you have concerns.</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>${companyName} Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
