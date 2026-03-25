import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { WelcomeEmailData } from './types';

export const getWelcomeEmailTemplate = (data: WelcomeEmailData): string => {
  const { userName } = data;
  const companyName = appConfig.name;
  const appUrl = appConfig.url;

  const content = `
    <h2>🎉 Welcome to ${companyName}, ${userName}!</h2>
    <p>We're excited to have you on board! Your email has been verified and your account is ready to go.</p>
    
    <div style="background-color: #e7f5ff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #1e40af;">Your Account is Ready!</h3>
      <p style="margin: 10px 0;">Start exploring everything ${companyName} has to offer.</p>
    </div>

    <h3 style="color: #1e40af;">Get Started</h3>
    <ul style="line-height: 2;">
      <li>👤 <a href="${appUrl}/profile" style="color: #3b82f6;"><strong>Complete your profile</strong></a> — Add your details and preferences</li>
      <li>📊 <a href="${appUrl}/dashboard" style="color: #3b82f6;"><strong>Explore your dashboard</strong></a> — See what's available at a glance</li>
      <li>💰 <a href="${appUrl}/pricing" style="color: #3b82f6;"><strong>Choose a subscription plan</strong></a> — Find the plan that fits your needs</li>
      <li>⚙️ <a href="${appUrl}/settings" style="color: #3b82f6;"><strong>Manage settings</strong></a> — Configure your account preferences</li>
    </ul>

    <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>

    <div style="background-color: #f8f9fa; padding: 15px 20px; margin: 25px 0; border-radius: 8px;">
      <p style="margin: 0;">
        <strong>💡 Pro Tip:</strong> Complete your profile to receive personalized recommendations 
        tailored to your preferences!
      </p>
    </div>

    <h3 style="color: #1e40af;">Need Help?</h3>
    <p>
      Check out our <a href="${appUrl}/contact" style="color: #3b82f6;">contact page</a> or reach out to our support team at 
      <a href="mailto:${appConfig.supportEmail}" style="color: #3b82f6;">${appConfig.supportEmail}</a>.
    </p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>The ${companyName} Team</strong>
    </p>

    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;" />
    <p style="font-size: 12px; color: #868e96; text-align: center;">
      You received this email because you signed up for ${companyName}.
      If you did not create this account, please <a href="mailto:${appConfig.supportEmail}" style="color: #868e96;">contact support</a>.
    </p>
  `;

  return getBaseEmailTemplate(content);
};
