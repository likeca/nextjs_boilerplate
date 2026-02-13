import { getBaseEmailTemplate } from './base-template';
import { appConfig } from '@/lib/config';
import type { PaymentReceiptEmailData } from './types';

export const getPaymentReceiptTemplate = (data: PaymentReceiptEmailData): string => {
  const { recipientName, transactionId, amount, currency = 'EUR', paymentDate, description } = data;
  const companyName = appConfig.name;

  const content = `
    <h2>💳 Payment Receipt</h2>
    <p>Hello ${recipientName ? recipientName : 'there'},</p>
    <p>Thank you for your payment. This email confirms that we have received your payment successfully.</p>
    
    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #155724;">✓ Payment Successful</h3>
      <p style="margin: 0; font-size: 16px;">Your transaction has been processed successfully.</p>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Transaction ID:</span>
        <span class="info-value" style="font-family: monospace;">${transactionId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount Paid:</span>
        <span class="info-value" style="font-size: 20px; font-weight: bold; color: #1e40af;">
          ${amount.toFixed(2)} ${currency}
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Date:</span>
        <span class="info-value">${paymentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Description:</span>
        <span class="info-value">${description}</span>
      </div>
    </div>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404;">
        <strong>📄 Keep this receipt:</strong> Save this email for your records. 
        You may need it for refunds, warranty claims, or accounting purposes.
      </p>
    </div>

    <a href="${appConfig.url}/profile/transactions" class="button">View All Transactions</a>

    <p style="margin-top: 30px;">
      If you have any questions about this payment, please contact us at 
      <a href="mailto:${process.env.SMTP_FROM_EMAIL || 'support@example.com'}" style="color: #3b82f6;">${process.env.SMTP_FROM_EMAIL || 'support@example.com'}</a> 
      and include your transaction ID.
    </p>
    
    <p style="margin-top: 30px;">
      Thank you for choosing ${companyName}!<br>
      <strong>${companyName} Team</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};
