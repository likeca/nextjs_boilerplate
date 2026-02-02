import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { WelcomeEmailData } from './types';

export const getWelcomeEmailTemplate = (data: WelcomeEmailData): string => {
  const { userName } = data;
  const companyName = appConfig.company.name;

  const content = `
    <h2>🎊 Welcome to ${companyName}!</h2>
    <p>Hello ${userName},</p>
    <p>Welcome aboard! We're thrilled to have you join the ${companyName} family.</p>
    
    <div style="background-color: #e7f5ff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #1e40af;">Your Account is Ready!</h3>
      <p style="margin: 10px 0;">You can now explore our premium yacht charter services and exclusive offerings.</p>
    </div>

    <h3 style="color: #1e40af;">What You Can Do:</h3>
    <ul style="line-height: 2;">
      <li>� <strong>Browse Features</strong> - Explore our curated collection of services</li>
      <li>📅 <strong>Get Started</strong> - Access your dashboard with just a few clicks</li>
      <li>💰 <strong>Special Offers</strong> - Get access to exclusive deals and early-bird discounts</li>
      <li>👤 <strong>Manage Profile</strong> - Update your preferences and settings</li>
    </ul>

    <a href="${appConfig.url}" class="button">Start Exploring</a>

    <div style="background-color: #f8f9fa; padding: 15px 20px; margin: 25px 0; border-radius: 8px;">
      <p style="margin: 0;">
        <strong>💡 Pro Tip:</strong> Complete your profile to receive personalized recommendations 
        tailored to your preferences!
      </p>
    </div>

    <p style="margin-top: 30px;">
      If you have any questions or need assistance, our support team is here to help at 
      <a href="mailto:${process.env.SMTP_FROM_EMAIL || 'support@example.com'}" style="color: #3b82f6;">${process.env.SMTP_FROM_EMAIL || 'support@example.com'}</a>
    </p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>The ${companyName} Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
