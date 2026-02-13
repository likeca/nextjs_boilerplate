/**
 * Audit logger for payment and security events
 * Provides structured logging for compliance and security monitoring
 */

export enum AuditEventType {
  // Payment Events
  CHECKOUT_SESSION_CREATED = "checkout_session_created",
  CHECKOUT_SESSION_COMPLETED = "checkout_session_completed",
  CHECKOUT_SESSION_FAILED = "checkout_session_failed",
  SUBSCRIPTION_CREATED = "subscription_created",
  SUBSCRIPTION_UPDATED = "subscription_updated",
  SUBSCRIPTION_CANCELLED = "subscription_cancelled",
  SUBSCRIPTION_DELETED = "subscription_deleted",
  PAYMENT_SUCCEEDED = "payment_succeeded",
  PAYMENT_FAILED = "payment_failed",
  BILLING_PORTAL_ACCESSED = "billing_portal_accessed",

  // Security Events
  WEBHOOK_SIGNATURE_INVALID = "webhook_signature_invalid",
  WEBHOOK_SIGNATURE_VALID = "webhook_signature_valid",
  UNAUTHORIZED_ACCESS_ATTEMPT = "unauthorized_access_attempt",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  AUTHORIZATION_FAILED = "authorization_failed",

  // Error Events
  WEBHOOK_PROCESSING_ERROR = "webhook_processing_error",
  DATABASE_ERROR = "database_error",
  STRIPE_API_ERROR = "stripe_api_error",
}

export interface AuditLogEntry {
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  status: "success" | "failure" | "warning";
  message: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class AuditLogger {
  private logLevel: string = process.env.LOG_LEVEL || "info";
  private isProd: boolean = process.env.NODE_ENV === "production";

  /**
   * Log an audit event
   */
  log(entry: Omit<AuditLogEntry, "timestamp">): void {
    const logEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // In production, you might want to send this to a logging service
    // (e.g., Datadog, Sentry, CloudWatch, etc.)
    if (this.isProd) {
      // Structured logging for production
      console.log(JSON.stringify(logEntry));
    } else {
      // Human-readable logging for development
      this.devLog(logEntry);
    }

    // TODO: Add integration with logging service
    // Example: sendToLoggingService(logEntry);
  }

  /**
   * Log a payment event
   */
  logPayment(
    eventType: AuditEventType,
    status: "success" | "failure" | "warning",
    message: string,
    options?: {
      userId?: string;
      email?: string;
      ipAddress?: string;
      resourceId?: string;
      metadata?: Record<string, any>;
      error?: Error;
    }
  ): void {
    this.log({
      eventType,
      status,
      message,
      userId: options?.userId,
      email: options?.email,
      ipAddress: options?.ipAddress,
      resourceId: options?.resourceId,
      resourceType: "payment",
      metadata: options?.metadata,
      error: options?.error
        ? {
            message: options.error.message,
            stack: this.isProd ? undefined : options.error.stack,
            code: (options.error as any).code,
          }
        : undefined,
    });
  }

  /**
   * Log a security event
   */
  logSecurity(
    eventType: AuditEventType,
    message: string,
    options?: {
      userId?: string;
      email?: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    this.log({
      eventType,
      status: "warning",
      message,
      userId: options?.userId,
      email: options?.email,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      resourceType: "security",
      metadata: options?.metadata,
    });
  }

  /**
   * Log a webhook event
   */
  logWebhook(
    eventType: AuditEventType,
    status: "success" | "failure" | "warning",
    message: string,
    options?: {
      ipAddress?: string;
      webhookEventId?: string;
      stripeEventType?: string;
      metadata?: Record<string, any>;
      error?: Error;
    }
  ): void {
    this.log({
      eventType,
      status,
      message,
      ipAddress: options?.ipAddress,
      resourceId: options?.webhookEventId,
      resourceType: "webhook",
      metadata: {
        ...options?.metadata,
        stripeEventType: options?.stripeEventType,
      },
      error: options?.error
        ? {
            message: options.error.message,
            stack: this.isProd ? undefined : options.error.stack,
          }
        : undefined,
    });
  }

  /**
   * Development-friendly logging
   */
  private devLog(entry: AuditLogEntry): void {
    const emoji = this.getEmoji(entry.status);
    const color = this.getColor(entry.status);

    console.log(
      `\n${color}${emoji} [${entry.eventType}] ${entry.status.toUpperCase()}\x1b[0m`
    );
    console.log(`   Time: ${entry.timestamp}`);
    if (entry.userId) console.log(`   User: ${entry.userId}`);
    if (entry.email) console.log(`   Email: ${entry.email}`);
    if (entry.ipAddress) console.log(`   IP: ${entry.ipAddress}`);
    if (entry.resourceId) console.log(`   Resource: ${entry.resourceId}`);
    console.log(`   Message: ${entry.message}`);
    if (entry.metadata) {
      console.log(`   Metadata:`, entry.metadata);
    }
    if (entry.error) {
      console.log(`   Error: ${entry.error.message}`);
      if (entry.error.stack) {
        console.log(`   Stack: ${entry.error.stack}`);
      }
    }
  }

  private getEmoji(status: string): string {
    switch (status) {
      case "success":
        return "✅";
      case "failure":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  }

  private getColor(status: string): string {
    switch (status) {
      case "success":
        return "\x1b[32m"; // Green
      case "failure":
        return "\x1b[31m"; // Red
      case "warning":
        return "\x1b[33m"; // Yellow
      default:
        return "\x1b[36m"; // Cyan
    }
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();
