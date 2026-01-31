import { getBaseEmailTemplate } from './base-template';
import type { WelcomeEmailData } from './types';

export const getWelcomeEmailTemplate = (data: WelcomeEmailData): string => {
  const { userName } = data;

  const content = `
    <h2>🎊 Welcome to Centourism!</h2>
    <p>Hello ${userName},</p>
    <p>Welcome aboard! We're thrilled to have you join the Centourism family.</p>
    
    <div style="background-color: #e7f5ff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #1e40af;">Your Account is Ready!</h3>
      <p style="margin: 10px 0;">You can now explore our premium yacht charter services and exclusive offerings.</p>
    </div>

    <h3 style="color: #1e40af;">What You Can Do:</h3>
    <ul style="line-height: 2;">
      <li>🚤 <strong>Browse Activities</strong> - Explore our curated collection of yacht experiences</li>
      <li>📅 <strong>Book Instantly</strong> - Reserve your dream charter with just a few clicks</li>
      <li>💰 <strong>Special Offers</strong> - Get access to exclusive deals and early-bird discounts</li>
      <li>👤 <strong>Manage Profile</strong> - Update your preferences and booking history</li>
    </ul>

    <a href="https://centourism.com" class="button">Start Exploring</a>

    <div style="background-color: #f8f9fa; padding: 15px 20px; margin: 25px 0; border-radius: 8px;">
      <p style="margin: 0;">
        <strong>💡 Pro Tip:</strong> Complete your profile to receive personalized recommendations 
        tailored to your preferences!
      </p>
    </div>

    <p style="margin-top: 30px;">
      If you have any questions or need assistance, our support team is here to help at 
      <a href="mailto:sales@centourism.com" style="color: #3b82f6;">sales@centourism.com</a>
    </p>
    
    <p style="margin-top: 30px;">
      Happy sailing!<br>
      <strong>The Centourism Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
