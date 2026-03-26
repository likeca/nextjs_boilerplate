import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmailService } from "@/lib/email-service";
import { appConfig } from "@/lib/config";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const EMAIL_CHANGE_TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail } = body;

    if (!newEmail) {
      return NextResponse.json(
        { error: "New email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    if (normalizedEmail === session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "New email must be different from current email" },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 400 }
      );
    }

    // Invalidate any previous pending requests for this user
    await prisma.emailChangeRequest.deleteMany({
      where: { userId: session.user.id },
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Create email change request
    await prisma.emailChangeRequest.create({
      data: {
        userId: session.user.id,
        newEmail: normalizedEmail,
        token,
        expiresAt: new Date(
          Date.now() + EMAIL_CHANGE_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
        ),
      },
    });

    const verificationUrl = `${appConfig.url}/verify-email-change?token=${token}`;
    const emailService = new EmailService();
    const userName = session.user.name || session.user.email.split("@")[0];

    // Send verification email to NEW address
    await emailService.sendEmail({
      type: "email_change_verification",
      recipients: [normalizedEmail],
      data: {
        recipientEmail: normalizedEmail,
        recipientName: userName,
        newEmail: normalizedEmail,
        verificationUrl,
        expiryHours: EMAIL_CHANGE_TOKEN_EXPIRY_HOURS,
      },
    });

    // Send notification to OLD address
    await emailService.sendEmail({
      type: "email_change_notification",
      recipients: [session.user.email],
      data: {
        recipientEmail: session.user.email,
        recipientName: userName,
        newEmail: normalizedEmail,
      },
    });

    console.log(
      "✅ [EmailChange] Verification sent to:",
      normalizedEmail,
      "| Notification sent to:",
      session.user.email
    );

    return NextResponse.json({
      success: true,
      message:
        "A verification email has been sent to your new email address. Please check your inbox to complete the change.",
    });
  } catch (error) {
    console.error("Email change request error:", error);
    return NextResponse.json(
      { error: "Failed to process email change request" },
      { status: 500 }
    );
  }
}
