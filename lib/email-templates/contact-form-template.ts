import { getBaseEmailTemplate } from './base-template';
import type { ContactFormEmailData } from './types';

export const getContactFormTemplate = (data: ContactFormEmailData): string => {
  const { fullName, email, phoneNumber, message } = data;

  const content = `
    <h2>📧 New Contact Form Inquiry</h2>
    <p>You have received a new message from the contact form on centourism.com</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${fullName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">
          <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
        </span>
      </div>
      ${phoneNumber ? `
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span class="info-value">${phoneNumber}</span>
      </div>
      ` : ''}
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #495057;">Message:</h3>
      <p style="white-space: pre-wrap; margin: 0;">${message}</p>
    </div>

    <p style="margin-top: 25px;">
      <strong>Recommended Actions:</strong>
    </p>
    <ul style="line-height: 1.8;">
      <li>Reply to this inquiry within 24 hours</li>
      <li>Use the email address provided above to respond</li>
      <li>Log this inquiry in your CRM system</li>
    </ul>

    <a href="mailto:${email}?subject=Re: Your inquiry on Centourism" class="button">Reply to Customer</a>
    
    <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
      This is an automated notification from your website contact form.
    </p>
  `;

  return getBaseEmailTemplate(content);
};
