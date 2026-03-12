'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';
import { getContactFormTemplate } from '@/lib/email-templates/contact-form-template';
import { appConfig } from '@/lib/config';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export async function submitContact(
  formData: ContactFormData
): Promise<{ success: true } | { error: string }> {
  const parsed = contactSchema.safeParse(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid form data' };
  }

  const { fullName, email, phoneNumber, message } = parsed.data;

  try {
    const adminEmailSetting = await db.setting.findUnique({ where: { key: 'email' } });
    const toEmail = adminEmailSetting?.value || process.env.SMTP_FROM_EMAIL;

    if (!toEmail) {
      return { error: 'Contact email is not configured. Please try again later.' };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const htmlContent = getContactFormTemplate({ fullName, email, phoneNumber, message });

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: toEmail,
      replyTo: email,
      subject: `New Contact Form Inquiry from ${fullName} — ${appConfig.name}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { error: 'Failed to send your message. Please try again later.' };
  }
}
