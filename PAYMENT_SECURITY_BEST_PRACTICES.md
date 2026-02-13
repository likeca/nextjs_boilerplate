# Payment Security Best Practices

This document outlines security best practices for the Stripe payment integration in this Next.js application.

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Webhook Security](#webhook-security)
3. [API Security](#api-security)
4. [Data Protection](#data-protection)
5. [Monitoring and Logging](#monitoring-and-logging)
6. [Incident Response](#incident-response)

---

## Environment Variables

### Required Variables
All payment-related environment variables must be properly secured:

```env
# Production - Use live keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Development - Use test keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Security Rules
- ✅ **NEVER** commit actual API keys to version control
- ✅ Use different keys for development, staging, and production
- ✅ Rotate keys regularly (at least quarterly)
- ✅ Store keys in secure environment variable management systems
- ✅ Use `.env.local` for local development (not tracked by git)
- ✅ Validate that production doesn't use test keys on startup

### Key Rotation Procedure
When rotating Stripe keys:
1. Generate new keys in Stripe Dashboard
2. Update keys in production environment
3. Test payment flow with new keys
4. Revoke old keys after 24 hours
5. Document the rotation in security logs

---

## Webhook Security

### Signature Verification
The webhook endpoint **MUST** verify Stripe signatures:

```typescript
// ✅ GOOD - Verifies signature
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  stripeConfig.webhookSecret
);

// ❌ BAD - No verification
const event = JSON.parse(body);
```

### HTTPS Requirement
- ✅ Production webhook endpoint **MUST** use HTTPS
- ✅ Configure webhook URL in Stripe Dashboard
- ✅ Use certificate from trusted CA (Let's Encrypt, DigiCert, etc.)

### Rate Limiting
Current implementation:
- **100 requests per 15 minutes** per IP address
- Configurable in `lib/security/rate-limiter.ts`

For production with high volume:
- Consider Redis-based rate limiting
- Implement distributed rate limiting for load-balanced systems

### Event Deduplication
The system prevents duplicate event processing:
- Stores event IDs for 24 hours
- Rejects events older than 24 hours (replay attack prevention)
- Returns 200 OK even for duplicate events (to acknowledge receipt)

### Security Headers
All webhook responses include:
```typescript
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
}
```

---

## API Security

### Authentication
All payment actions require authentication:

```typescript
const session = await auth.api.getSession({ headers });
if (!session?.user) {
  return { error: "Authentication required" };
}
```

### Authorization
Verify user ownership before operations:

```typescript
const subscription = await prisma.subscription.findUnique({
  where: {
    id: subscriptionId,
    userId: session.user.id, // ✅ Verify ownership
  },
});
```

### Input Validation
Always validate inputs:
- Check data types
- Validate UUIDs/IDs
- Sanitize user inputs
- Verify plan existence and active status

### Idempotency
Use idempotency keys for Stripe API calls:

```typescript
const idempotencyKey = `checkout_${userId}_${planId}_${Date.now()}`;
await stripe.checkout.sessions.create(data, { idempotencyKey });
```

### Error Handling
- ✅ **DO:** Return generic error messages to clients
- ✅ **DO:** Log detailed errors server-side
- ❌ **DON'T:** Expose stack traces to clients
- ❌ **DON'T:** Leak internal implementation details

Example:
```typescript
try {
  // ... operation
} catch (error) {
  auditLogger.log(...); // ✅ Detailed server-side log
  return { error: "Unable to process request" }; // ✅ Generic client message
}
```

---

## Data Protection

### PCI DSS Compliance
This implementation is PCI-compliant because:
- ✅ No card data is stored in our database
- ✅ All card processing happens on Stripe's servers
- ✅ Using Stripe Checkout (hosted payment page)
- ✅ Never log or store card numbers, CVV, or expiry dates

### Personal Data (GDPR)
Payment data contains personal information:
- User email addresses
- Payment amounts
- Subscription status
- Billing history

**User Rights:**
- Right to access their data
- Right to delete their data
- Right to export their data

**Implementation:**
- Provide API endpoints for data export
- Implement soft deletes for audit trail
- Anonymize user data on deletion (keep payment records for compliance)

### Database Security
- ✅ Use unique constraints on Stripe IDs
- ✅ Use UUID-based primary keys (harder to enumerate)
- ✅ Add indexes on frequently queried fields
- ✅ Use cascade deletes carefully
- ✅ Regular database backups
- ✅ Encrypt database at rest (infrastructure level)

---

## Monitoring and Logging

### Audit Logging
The system logs all payment-related events:

```typescript
auditLogger.logPayment(
  AuditEventType.PAYMENT_SUCCEEDED,
  "success",
  "Payment completed",
  {
    userId,
    email,
    ipAddress,
    resourceId,
    metadata: { amount, currency }
  }
);
```

### What to Monitor

#### Payment Metrics
- Successful checkout sessions per hour/day
- Failed payments rate
- Subscription cancellations rate
- Webhook processing latency
- Rate limit hits

#### Security Metrics
- Invalid webhook signature attempts
- Unauthorized access attempts
- Rate limit violations
- Old webhook events (potential replay attacks)
- Failed authorization checks

### Alerting Thresholds

**Critical (Immediate Response):**
- Webhook signature failures > 10/hour
- Payment processing errors > 20%
- Database connection failures

**Warning (Review within 1 hour):**
- Failed payments > 10%
- Rate limit hits > 50/hour
- Unusual subscription cancellation rate

**Info (Daily Review):**
- Total payments processed
- New subscriptions
- Cancelled subscriptions

### Log Retention
- Production logs: 90 days minimum
- Security logs: 1 year minimum
- Audit logs: 7 years (compliance)
- Payment records: Permanent (compliance)

---

## Incident Response

### Security Incident Types

1. **Compromised API Keys**
2. **Unauthorized Access**
3. **Payment Data Breach**
4. **Service Disruption**
5. **Fraudulent Transactions**

### Response Procedure

#### 1. Compromised API Keys

**Immediate Actions:**
1. Revoke compromised keys in Stripe Dashboard
2. Generate new keys
3. Update production environment variables
4. Restart application servers
5. Review audit logs for suspicious activity

**Follow-up:**
- Investigate how keys were compromised
- Review access control policies
- Update security procedures
- Document incident

#### 2. Unauthorized Access

**Immediate Actions:**
1. Identify affected user accounts
2. Force logout all sessions
3. Require password reset
4. Review audit logs
5. Check for data exfiltration

**Follow-up:**
- Notify affected users
- Review authentication mechanisms
- Implement additional security measures
- Document incident

#### 3. Payment Data Breach

**Immediate Actions:**
1. Isolate affected systems
2. Preserve evidence
3. Contact Stripe immediately
4. Engage legal counsel
5. Prepare user notification

**Follow-up:**
- Comply with breach notification laws
- Conduct security audit
- Implement remediation measures
- Update incident response plan

#### 4. Service Disruption

**Immediate Actions:**
1. Identify root cause
2. Implement fix or workaround
3. Communicate with users
4. Monitor service recovery

**Follow-up:**
- Post-mortem analysis
- Implement preventive measures
- Update monitoring
- Document lessons learned

#### 5. Fraudulent Transactions

**Immediate Actions:**
1. Document transaction details
2. Report to Stripe
3. Suspend affected accounts
4. Review similar transactions
5. Implement additional fraud checks

**Follow-up:**
- Update fraud detection rules
- Review Stripe Radar settings
- Train team on fraud patterns
- Document incident

### Contact Information

**Stripe Support:**
- Emergency: https://support.stripe.com
- Phone: Available in Stripe Dashboard

**Internal Team:**
- Security Lead: [Email]
- Engineering Lead: [Email]
- On-call rotation: [Link to PagerDuty/etc]

---

## Testing

### Security Testing Checklist

**Before Each Release:**
- [ ] Run CodeQL security scanner
- [ ] Test webhook signature verification
- [ ] Test rate limiting
- [ ] Verify authentication on all endpoints
- [ ] Test authorization (user cannot access others' data)
- [ ] Verify error messages don't leak information
- [ ] Test idempotency of payment operations
- [ ] Review audit logs

**Quarterly:**
- [ ] Penetration testing
- [ ] Key rotation
- [ ] Review access controls
- [ ] Update dependencies
- [ ] Security training for team

**Annually:**
- [ ] Full security audit
- [ ] Review incident response plan
- [ ] Update security documentation
- [ ] Compliance review

### Test Cards

**Stripe Test Cards:**
```
Success: 4242 4242 4242 4242
Auth Required: 4000 0025 0000 3155
Declined: 4000 0000 0000 9995
Insufficient Funds: 4000 0000 0000 9995
```

Use any future expiry date, any 3-digit CVC, any postal code.

---

## Compliance Checklist

### PCI DSS
- [x] No card data stored
- [x] Using Stripe Checkout (PCI-compliant)
- [x] HTTPS enforced
- [x] Secure key storage
- [x] Access controls implemented
- [x] Audit logging enabled

### GDPR (if applicable)
- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] Data export capability
- [ ] Right to deletion implemented
- [ ] Data processing agreement with Stripe
- [ ] Data retention policies documented

### SOC 2 (if pursuing)
- [ ] Security policies documented
- [ ] Access controls implemented
- [ ] Change management process
- [ ] Incident response plan
- [ ] Vendor management (Stripe)
- [ ] Regular security training

---

## Production Deployment Checklist

Before going live with payments:

### Configuration
- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint in Stripe Dashboard
- [ ] Configure proper HTTPS certificate
- [ ] Set correct `NEXT_PUBLIC_APP_URL`
- [ ] Enable production logging
- [ ] Configure monitoring and alerts

### Security
- [ ] Rate limiting enabled
- [ ] Audit logging configured
- [ ] Security headers set
- [ ] Input validation verified
- [ ] Error handling reviewed
- [ ] Access controls tested

### Testing
- [ ] End-to-end payment flow tested
- [ ] Webhook processing verified
- [ ] Subscription management tested
- [ ] Cancellation flow tested
- [ ] Refund process tested (if applicable)
- [ ] Edge cases covered

### Documentation
- [ ] Security procedures documented
- [ ] Incident response plan ready
- [ ] Team trained on security
- [ ] Contact information updated
- [ ] Legal documents updated (terms, privacy)

### Monitoring
- [ ] Payment metrics dashboard
- [ ] Error rate alerts
- [ ] Security event monitoring
- [ ] Webhook latency monitoring
- [ ] Database performance monitoring

---

## Additional Resources

- [Stripe Security](https://stripe.com/docs/security)
- [PCI DSS](https://www.pcisecuritystandards.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [GDPR Compliance](https://gdpr.eu/)

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-13  
**Next Review:** 2026-05-13
