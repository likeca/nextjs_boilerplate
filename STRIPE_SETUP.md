# Stripe Payment Integration

This SAAS boilerplate now includes Stripe payment integration with subscription management.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install stripe
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Create Stripe Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add Product**
3. Create three products:
   - **Starter**: $9.99/month and $99.99/year
   - **Professional**: $29.99/month and $299.99/year
   - **Enterprise**: $99.99/month and $999.99/year

4. For each product, create both monthly and yearly pricing options
5. Copy the Price IDs and Product IDs

### 4. Update Plan Seed Script

Edit `scripts/seed-plans.ts` and replace the placeholder Stripe IDs with your actual IDs:

```typescript
stripePriceId: "price_1234567890", // Your actual Stripe Price ID
stripeProductId: "prod_1234567890", // Your actual Stripe Product ID
```

### 5. Run Database Migrations

```bash
npx prisma migrate dev --name add_stripe_models
npx prisma generate
```

### 6. Seed the Database with Plans

```bash
npm run seed:plans
```

### 7. Set Up Stripe Webhook

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret and add it to your `.env` file

For production, set up a webhook endpoint in your Stripe Dashboard:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## Features

### Pricing Display
- Monthly and yearly pricing toggle
- Three pricing tiers (Starter, Professional, Enterprise)
- Feature comparison
- Popular plan badge
- Responsive design

### Payment Flow
1. User clicks "Buy Now" on a plan
2. System checks if user is logged in
3. If not logged in, redirects to login page
4. If logged in, creates Stripe checkout session
5. Redirects to Stripe checkout page
6. After successful payment, redirects to success page
7. Webhook updates database with subscription info

### Subscription Management
- Active subscription tracking
- Automatic renewal handling
- Cancellation support
- Payment history

## File Structure

```
lib/payments/stripe/
  ├── config.ts          # Stripe configuration
  ├── utils.ts           # Helper functions
  └── plans.ts           # Plan definitions

actions/payments/
  ├── create-checkout-session.ts
  ├── get-user-subscription.ts
  ├── cancel-subscription.ts
  └── get-plans.ts

app/api/webhooks/stripe/
  └── route.ts           # Webhook handler

app/payment/
  ├── success/page.tsx   # Success page
  └── cancel/page.tsx    # Cancel page

components/
  ├── pricing-cards.tsx  # Client component for pricing UI
  └── pricing-section.tsx # Server component wrapper

scripts/
  └── seed-plans.ts      # Database seeding script
```

## Testing

### Test Mode
Use Stripe test cards for testing:
- Successful payment: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Webhook Testing
Use the Stripe CLI to test webhooks locally:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

## Production Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Update webhook endpoint in Stripe Dashboard
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Test payment flow end-to-end
- [ ] Set up monitoring for payment failures
- [ ] Configure email notifications for subscriptions
- [ ] Review and adjust pricing
- [ ] Update terms of service and privacy policy

## Usage

### Display Pricing on Homepage
The pricing section is automatically included on the homepage and shows:
- All active plans from the database
- Monthly/yearly toggle
- Buy now buttons (requires login)

### Check User Subscription
```typescript
import { getUserSubscription } from "@/actions/payments/get-user-subscription";

const { subscription } = await getUserSubscription();
if (subscription?.status === "active") {
  // User has active subscription
}
```

### Cancel Subscription
```typescript
import { cancelSubscription } from "@/actions/payments/cancel-subscription";

await cancelSubscription(subscriptionId);
```

## Support

For Stripe-related questions, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
