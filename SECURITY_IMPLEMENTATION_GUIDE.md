# Security Implementation Guide

This document provides implementation details for the security features in the payment system.

## Overview

The payment system includes three core security utilities:

1. **Rate Limiter** - Prevents abuse through request throttling
2. **Audit Logger** - Tracks all payment and security events
3. **Webhook Event Store** - Prevents replay attacks and duplicate processing

## Rate Limiter

### Location
`lib/security/rate-limiter.ts`

### Features
- In-memory request tracking
- Configurable rate limits per identifier
- Automatic cleanup of expired entries
- Support for multiple identifiers (IP, user ID, etc.)

### Usage

#### Basic Usage
```typescript
import { createRateLimitMiddleware, getClientIdentifier } from "@/lib/security/rate-limiter";

// Create rate limiter: 10 requests per minute
const rateLimiter = createRateLimitMiddleware(10, 60 * 1000);

// In your route handler
const headers = await headers();
const clientIp = getClientIdentifier(headers);
const rateLimit = rateLimiter(clientIp);

if (!rateLimit.allowed) {
  return NextResponse.json(
    { error: "Rate limit exceeded" },
    { 
      status: 429,
      headers: {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetAt.toString(),
        "Retry-After": Math.ceil(rateLimit.resetAt / 1000).toString(),
      },
    }
  );
}
```

#### Configuration
```typescript
// Webhook endpoint: 100 requests per 15 minutes
const webhookLimiter = createRateLimitMiddleware(100, 15 * 60 * 1000);

// API endpoint: 60 requests per minute
const apiLimiter = createRateLimitMiddleware(60, 60 * 1000);

// Strict endpoint: 5 requests per hour
const strictLimiter = createRateLimitMiddleware(5, 60 * 60 * 1000);
```

#### Client Identification
The `getClientIdentifier` function extracts client IP from various headers:
- `x-forwarded-for` (most common for reverse proxies)
- `x-real-ip` (Nginx)
- `cf-connecting-ip` (Cloudflare)

### Production Considerations

For distributed systems or high-traffic applications:

1. **Use Redis for Distributed Rate Limiting**
```typescript
// Example with Redis (requires ioredis package)
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimit(identifier: string, maxRequests: number, windowMs: number) {
  const key = `ratelimit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.pexpire(key, windowMs);
  }
  
  return current <= maxRequests;
}
```

2. **Configure Different Limits per Environment**
```typescript
const limits = {
  development: { max: 1000, window: 60 * 1000 },
  staging: { max: 500, window: 60 * 1000 },
  production: { max: 100, window: 60 * 1000 },
};

const config = limits[process.env.NODE_ENV || "development"];
const rateLimiter = createRateLimitMiddleware(config.max, config.window);
```

---

## Audit Logger

### Location
`lib/security/audit-logger.ts`

### Features
- Structured logging for all payment events
- Security event tracking
- Development-friendly output with colors and emojis
- Production-ready JSON output
- Support for custom logging services

### Event Types

```typescript
enum AuditEventType {
  // Payment Events
  CHECKOUT_SESSION_CREATED,
  CHECKOUT_SESSION_COMPLETED,
  CHECKOUT_SESSION_FAILED,
  SUBSCRIPTION_CREATED,
  SUBSCRIPTION_UPDATED,
  SUBSCRIPTION_CANCELLED,
  SUBSCRIPTION_DELETED,
  PAYMENT_SUCCEEDED,
  PAYMENT_FAILED,
  BILLING_PORTAL_ACCESSED,

  // Security Events
  WEBHOOK_SIGNATURE_INVALID,
  WEBHOOK_SIGNATURE_VALID,
  UNAUTHORIZED_ACCESS_ATTEMPT,
  RATE_LIMIT_EXCEEDED,
  AUTHORIZATION_FAILED,

  // Error Events
  WEBHOOK_PROCESSING_ERROR,
  DATABASE_ERROR,
  STRIPE_API_ERROR,
}
```

### Usage

#### Log Payment Event
```typescript
import { auditLogger, AuditEventType } from "@/lib/security/audit-logger";

auditLogger.logPayment(
  AuditEventType.PAYMENT_SUCCEEDED,
  "success",
  "Payment processed successfully",
  {
    userId: "user_123",
    email: "user@example.com",
    ipAddress: "192.168.1.1",
    resourceId: "payment_456",
    metadata: {
      amount: 9999,
      currency: "usd",
      planId: "plan_789"
    },
  }
);
```

#### Log Security Event
```typescript
auditLogger.logSecurity(
  AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
  "Unauthorized access to subscription",
  {
    userId: "user_123",
    ipAddress: "192.168.1.1",
    metadata: {
      requestedResource: "subscription_456",
      reason: "Not the subscription owner"
    },
  }
);
```

#### Log Webhook Event
```typescript
auditLogger.logWebhook(
  AuditEventType.WEBHOOK_PROCESSING_ERROR,
  "failure",
  "Failed to process webhook event",
  {
    ipAddress: "192.168.1.1",
    webhookEventId: "evt_123",
    stripeEventType: "checkout.session.completed",
    error: new Error("Database connection failed"),
    metadata: {
      attemptNumber: 1,
    },
  }
);
```

### Output Formats

#### Development Output
```
✅ [PAYMENT_SUCCEEDED] SUCCESS
   Time: 2026-02-13T06:58:01.897Z
   User: user_123
   Email: user@example.com
   IP: 192.168.1.1
   Resource: payment_456
   Message: Payment processed successfully
   Metadata: { amount: 9999, currency: 'usd', planId: 'plan_789' }
```

#### Production Output (JSON)
```json
{
  "timestamp": "2026-02-13T06:58:01.897Z",
  "eventType": "payment_succeeded",
  "userId": "user_123",
  "email": "user@example.com",
  "ipAddress": "192.168.1.1",
  "resourceId": "payment_456",
  "resourceType": "payment",
  "status": "success",
  "message": "Payment processed successfully",
  "metadata": {
    "amount": 9999,
    "currency": "usd",
    "planId": "plan_789"
  }
}
```

### Integration with Logging Services

To send logs to external services (Datadog, Sentry, CloudWatch, etc.):

```typescript
// In lib/security/audit-logger.ts

log(entry: AuditLogEntry): void {
  const logEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Standard logging
  if (this.isProd) {
    console.log(JSON.stringify(logEntry));
  } else {
    this.devLog(logEntry);
  }

  // Send to external service
  if (this.isProd) {
    // Datadog example
    // datadogLogger.log(logEntry);
    
    // Sentry example (for errors)
    // if (entry.status === "failure" && entry.error) {
    //   Sentry.captureException(entry.error, {
    //     tags: { eventType: entry.eventType },
    //     extra: entry.metadata,
    //   });
    // }
    
    // CloudWatch example
    // cloudwatchLogger.putLogEvents({
    //   logGroupName: '/aws/lambda/payment-events',
    //   logStreamName: new Date().toISOString().split('T')[0],
    //   logEvents: [{ timestamp: Date.now(), message: JSON.stringify(logEntry) }]
    // });
  }
}
```

---

## Webhook Event Store

### Location
`lib/security/webhook-event-store.ts`

### Features
- Prevents duplicate webhook processing
- Detects replay attacks (old events)
- Automatic cleanup of processed events
- 24-hour event retention

### Usage

#### Basic Usage
```typescript
import { createEventGuard } from "@/lib/security/webhook-event-store";

// In webhook handler
const eventGuard = createEventGuard(
  event.id,           // Stripe event ID
  event.type,         // Event type (e.g., "checkout.session.completed")
  event.created       // Unix timestamp when event was created
);

if (!eventGuard.shouldProcess) {
  auditLogger.logWebhook(
    AuditEventType.WEBHOOK_PROCESSING_ERROR,
    "warning",
    `Event skipped: ${eventGuard.reason}`,
    { webhookEventId: event.id }
  );
  
  return NextResponse.json({ 
    received: true, 
    processed: false, 
    reason: eventGuard.reason 
  });
}

// Process the event
try {
  await handleWebhookEvent(event);
  
  // Mark as processed after successful handling
  eventGuard.markProcessed();
  
  return NextResponse.json({ received: true });
} catch (error) {
  // Error handling
}
```

#### Get Statistics
```typescript
import { webhookEventStore } from "@/lib/security/webhook-event-store";

const stats = webhookEventStore.getStats();
console.log(stats);
// {
//   totalProcessed: 1542,
//   oldestEvent: "2026-02-12T06:58:01.897Z",
//   newestEvent: "2026-02-13T06:58:01.897Z"
// }
```

### Configuration

#### Adjust Retention Period
```typescript
// In webhook-event-store.ts

class WebhookEventStore {
  private readonly MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours (default)
  // Change to: 48 * 60 * 60 * 1000 for 48 hours
  
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour (default)
  // Change to: 30 * 60 * 1000 for 30 minutes
}
```

### Production Considerations

For distributed systems:

```typescript
// Use Redis for distributed event storage
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function shouldProcessEvent(eventId: string, eventCreated: number) {
  const key = `webhook:processed:${eventId}`;
  const exists = await redis.get(key);
  
  if (exists) {
    return { shouldProcess: false, reason: "Already processed" };
  }
  
  // Check age
  const eventAge = Date.now() - eventCreated * 1000;
  const MAX_AGE = 24 * 60 * 60 * 1000;
  
  if (eventAge > MAX_AGE) {
    return { shouldProcess: false, reason: "Event too old" };
  }
  
  return { shouldProcess: true };
}

async function markEventProcessed(eventId: string) {
  const key = `webhook:processed:${eventId}`;
  await redis.setex(key, 86400, "1"); // 24 hour TTL
}
```

---

## Complete Example: Secured API Route

Here's a complete example showing all security features together:

```typescript
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientIdentifier, createRateLimitMiddleware } from "@/lib/security/rate-limiter";
import { auditLogger, AuditEventType } from "@/lib/security/audit-logger";

// Rate limiter: 60 requests per minute per IP
const rateLimiter = createRateLimitMiddleware(60, 60 * 1000);

export async function POST(request: NextRequest) {
  const requestHeaders = await headers();
  const clientIp = getClientIdentifier(requestHeaders);
  
  // 1. Apply rate limiting
  const rateLimit = rateLimiter(clientIp);
  if (!rateLimit.allowed) {
    auditLogger.logSecurity(
      AuditEventType.RATE_LIMIT_EXCEEDED,
      "Rate limit exceeded",
      {
        ipAddress: clientIp,
        metadata: { endpoint: "/api/payment/action" },
      }
    );
    
    return NextResponse.json(
      { error: "Too many requests" },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "Retry-After": Math.ceil(rateLimit.resetAt / 1000).toString(),
        },
      }
    );
  }
  
  // 2. Authenticate user
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user) {
    auditLogger.logSecurity(
      AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
      "Unauthorized API access",
      { ipAddress: clientIp }
    );
    
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  // 3. Process request
  try {
    const data = await request.json();
    
    // Validate input
    if (!data.subscriptionId) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }
    
    // Check authorization
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: data.subscriptionId,
        userId: session.user.id, // Ensure ownership
      },
    });
    
    if (!subscription) {
      auditLogger.logSecurity(
        AuditEventType.AUTHORIZATION_FAILED,
        "Access denied to subscription",
        {
          userId: session.user.id,
          ipAddress: clientIp,
          metadata: { subscriptionId: data.subscriptionId },
        }
      );
      
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    
    // Process action
    // ... your business logic
    
    auditLogger.logPayment(
      AuditEventType.SUBSCRIPTION_UPDATED,
      "success",
      "Subscription action completed",
      {
        userId: session.user.id,
        email: session.user.email,
        ipAddress: clientIp,
        resourceId: subscription.id,
      }
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.DATABASE_ERROR,
      "failure",
      "Failed to process request",
      {
        userId: session.user.id,
        ipAddress: clientIp,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
```

---

## Testing

### Test Rate Limiter
```typescript
import { rateLimiter } from "@/lib/security/rate-limiter";

// Test rate limiting
for (let i = 0; i < 12; i++) {
  const allowed = rateLimiter.check("test-ip", 10, 60000);
  console.log(`Request ${i + 1}: ${allowed ? "✅" : "❌"}`);
}
// Should allow first 10, deny last 2
```

### Test Audit Logger
```typescript
import { auditLogger, AuditEventType } from "@/lib/security/audit-logger";

// Test logging
auditLogger.logPayment(
  AuditEventType.PAYMENT_SUCCEEDED,
  "success",
  "Test payment",
  {
    userId: "test-user",
    metadata: { amount: 1000 }
  }
);
```

### Test Webhook Event Store
```typescript
import { createEventGuard } from "@/lib/security/webhook-event-store";

// Test duplicate detection
const eventId = "evt_test_123";
const eventType = "test.event";
const created = Math.floor(Date.now() / 1000);

const guard1 = createEventGuard(eventId, eventType, created);
console.log("First attempt:", guard1.shouldProcess); // true

guard1.markProcessed();

const guard2 = createEventGuard(eventId, eventType, created);
console.log("Second attempt:", guard2.shouldProcess); // false
console.log("Reason:", guard2.reason); // "Event already processed at ..."
```

---

## Monitoring

### Key Metrics to Track

1. **Rate Limiting**
   - Rate limit hits per hour/day
   - Top IPs hitting rate limits
   - False positive rate

2. **Audit Logging**
   - Total events logged per day
   - Events by type
   - Error rate by event type
   - Response time impact

3. **Webhook Processing**
   - Duplicate events prevented
   - Old events rejected
   - Processing latency
   - Error rate

### Sample Monitoring Query (Datadog/CloudWatch)
```
# Rate limit violations
count(audit_log{event_type:rate_limit_exceeded}) by (ip_address)

# Payment success rate
count(audit_log{event_type:payment_*}) by (status)

# Webhook processing errors
count(audit_log{event_type:webhook_processing_error})
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Review rate limit hits
- Check for unusual patterns
- Monitor error rates

**Weekly:**
- Analyze audit logs
- Review security events
- Check webhook processing stats

**Monthly:**
- Tune rate limits based on usage
- Update event retention policies
- Review and archive old logs

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-13
