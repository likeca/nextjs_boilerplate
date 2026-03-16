import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { SubscriptionEmailData } from './types';

export const getSubscriptionEmailTemplate = (
  data: SubscriptionEmailData,
  event: 'created' | 'cancelled'
): string => {
  const { recipientName, planName, currentPeriodEnd } = data;
  const companyName = appConfig.name;

  if (event === 'created') {
    const content = `
      <h2>\uD83C\uDF89 Subscription Confirmed!</h2>
      <p>Hello ${recipientName || 'there'},</p>
      <p>Thank you for subscribing! Your subscription is now active and you have full access to all features.</p>
      
      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #155724;">\u2713 Subscription Active</h3>
        ${planName ? `<p style="margin: 0;">Plan: <strong>${planName}</strong></p>` : ''}
        ${currentPeriodEnd ? `<p style="margin: 5px 0 0;">Next billing date: <strong>${currentPeriodEnd}</strong></p>` : ''}
      </div>

      <a href="${appConfig.url}/billing" class="button">View Subscription</a>

      <p style="margin-top: 30px;">
        Thank you for choosing ${companyName}!<br>
        <strong>${companyName} Team</strong>
      </p>
    `;
    return getBaseEmailTemplate(content);
  }

  const content = `
    <h2>Subscription Cancelled</h2>
    <p>Hello ${recipientName || 'there'},</p>
    <p>Your subscription has been cancelled. You will continue to have access until the end of your current billing period.</p>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #856404;">Subscription Ended</h3>
      <p style="margin: 0;">We're sorry to see you go. If you change your mind, you can resubscribe at any time.</p>
    </div>

    <a href="${appConfig.url}/billing" class="button">Resubscribe</a>

    <p style="margin-top: 30px;">
      If you have any questions, please contact our support team.<br>
      <strong>${companyName} Team</strong>
    </p>
  `;
  return getBaseEmailTemplate(content);
};
