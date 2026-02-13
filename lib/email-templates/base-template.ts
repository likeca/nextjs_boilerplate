import { appConfig } from '@/lib/config';

export const getBaseEmailTemplate = (content: string): string => {
  const companyName = appConfig.name;
  const appDescription = appConfig.description;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${companyName}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          padding: 30px 20px;
          text-align: center;
          color: #ffffff;
        }
        .email-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .email-body {
          padding: 40px 30px;
          color: #333333;
          line-height: 1.6;
        }
        .email-footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          border-top: 1px solid #e9ecef;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #3b82f6;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #1e40af;
          text-align: center;
          padding: 20px;
          background-color: #f0f9ff;
          border-radius: 8px;
          margin: 20px 0;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #3b82f6;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #495057;
        }
        .info-value {
          color: #212529;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: #6c757d;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>${companyName}</h1>
        </div>
        <div class="email-body">
          ${content}
        </div>
        <div class="email-footer">
          <p><strong>${companyName}</strong></p>
          <p>${appDescription}</p>
          <div class="social-links">
            <a href="${appConfig.url}">Website</a> |
            <a href="mailto:${process.env.SMTP_FROM_EMAIL || 'support@example.com'}">Contact Us</a>
          </div>
          <p style="font-size: 12px; color: #868e96; margin-top: 15px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
