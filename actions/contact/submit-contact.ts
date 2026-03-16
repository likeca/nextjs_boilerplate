'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
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

  // Capture the submitter's IP for spam / audit purposes
  const headersList = await headers();
  const ipAddress =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    null;

  try {
    // Persist the submission before attempting to send email
    await prisma.contactSubmission.create({
      data: {
        fullName,
        email,
        phoneNumber: phoneNumber ?? null,
        message,
        ipAddress,
      },
    });

    // Send email notification to admin (non-blocking — failure returns success
    // so the user isn't penalised for a transient SMTP error)
    try {
      const adminEmailSetting = await prisma.setting.findUnique({
        where: { key: 'email' },
      });
      const toEmail = adminEmailSetting?.value || process.env.SMTP_FROM_EMAIL;

      if (toEmail) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const htmlContent = getContactFormTemplate({
          fullName,
          email,
          phoneNumber,
          message,
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL,
          to: toEmail,
          replyTo: email,
          subject: `New Contact Form Inquiry from ${fullName} — ${appConfig.name}`,
          html: htmlContent,
        });
      }
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { error: 'Failed to send your message. Please try again later.' };
  }
}
