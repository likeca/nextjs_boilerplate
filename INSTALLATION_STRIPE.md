# 🚀 Stripe Integration - Installation Guide

This guide will walk you through setting up Stripe payments in your SaaS boilerplate.

## Prerequisites

- Node.js installed
- PostgreSQL database running
- Stripe account (free to create)
- Stripe CLI installed (for webhook testing)

---

## Step-by-Step Installation

### Step 1: Install Stripe Package

```bash
npm install stripe
```

This installs the official Stripe Node.js library.

---

### Step 2: Set Up Stripe Account

1. **Create a Stripe account** (if you don't have one):
   - Go to [https://stripe.com](https://stripe.com)
   - Sign up for a free account
   - Complete account setup

2. **Get your API keys**:
   - Go to [Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

---

### Step 3: Update Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51YourActualStripeSecretKeyHere...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51YourActualStripePublishableKeyHere...
STRIPE_WEBHOOK_SECRET=whsec_YourWebhookSecretHere...

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Keep `STRIPE_WEBHOOK_SECRET` empty for now. We'll fill it in Step 6.

---

### Step 4: Create Stripe Products & Prices

These are the plans your customers will subscribe to.

#### 4.1 Create Products

1. Go to [Dashboard → Products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"**

Create these 3 products:

**Product 1: Starter**
- Name: `Starter`
- Description: `Perfect for individuals and small projects`
- Click "Add pricing"

**Product 2: Professional**
- Name: `Professional`
- Description: `Ideal for growing teams and businesses`
- Click "Add pricing"

**Product 3: Enterprise**
- Name: `Enterprise`
- Description: `For large organizations with advanced needs`
- Click "Add pricing"

#### 4.2 Add Pricing for Each Product

For **each product**, create **two prices** (monthly and yearly):

##### Starter Pricing
1. **Monthly Price:**
   - Model: `Standard pricing`
   - Price: `$9.99`
   - Billing period: `Monthly`
   - Click "Add price"

2. **Yearly Price:**
   - Click "Add another price"
   - Price: `$99.99`
   - Billing period: `Yearly`
   - Click "Add price"

##### Professional Pricing
1. **Monthly Price:**
   - Price: `$29.99`
   - Billing period: `Monthly`

2. **Yearly Price:**
   - Price: `$299.99`
   - Billing period: `Yearly`

##### Enterprise Pricing
1. **Monthly Price:**
   - Price: `$99.99`
   - Billing period: `Monthly`

2. **Yearly Price:**
   - Price: `$999.99`
   - Billing period: `Yearly`

#### 4.3 Copy Price IDs

For each price you created:
1. Click on the price
2. Copy the **Price ID** (starts with `price_`)
3. Also note the **Product ID** (starts with `prod_`)

You should have **6 Price IDs** total (2 for each product).

---

### Step 5: Update Seed Script

Open `scripts/seed-plans.ts` and replace the placeholder IDs with your actual Stripe IDs:

```typescript
// Find this section in the file:
{
  name: "Starter",
  stripePriceId: "price_starter_monthly", // ← Replace this
  stripeProductId: "prod_starter",        // ← Replace this
  // ...
}
```

Replace with your actual IDs:

```typescript
{
  name: "Starter",
  stripePriceId: "price_1ABC123...",     // Your actual monthly price ID
  stripeProductId: "prod_ABC123...",     // Your actual product ID
  // ...
}
```

Do this for **all 6 plans** (3 products × 2 prices each).

---

### Step 6: Run Database Migrations

```bash
# Generate and apply migration
npx prisma migrate dev --name add_stripe_models

# Generate Prisma Client
npx prisma generate
```

This creates the new database tables:
- `Plan`
- `Subscription`
- `Payment`

---

### Step 7: Seed the Database

```bash
npm run seed:plans
```

This populates your database with the pricing plans.

**Expected output:**
```
Seeding plans...
Plans seeded successfully!
```

---

### Step 8: Set Up Stripe Webhook (Development)

#### 8.1 Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from [https://github.com/stripe/stripe-cli/releases/latest](https://github.com/stripe/stripe-cli/releases/latest)

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_Linux_x86_64.tar.gz
tar -xvf stripe_Linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

#### 8.2 Login to Stripe CLI

```bash
stripe login
```

This opens your browser to authorize the CLI.

#### 8.3 Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Expected output:**
```
> Ready! You are using Stripe API Version [2024-XX-XX]. Your webhook signing secret is whsec_1234567890abcdef...
```

#### 8.4 Copy Webhook Secret

1. Copy the webhook signing secret from the output (starts with `whsec_`)
2. Add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

3. **Restart your development server** for the change to take effect

---

### Step 9: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎉 Testing Your Integration

### Test the Pricing Display

1. Go to the homepage
2. Scroll down to see the pricing section
3. Toggle between Monthly and Yearly
4. Verify all 3 plans are displayed

### Test the Payment Flow

1. **Create a test account:**
   - Click "Sign Up"
   - Register with a test email

2. **Try to purchase a plan:**
   - Click "Buy Now" on any plan
   - You should be redirected to Stripe Checkout

3. **Use a test card:**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

4. **Complete payment:**
   - Click "Subscribe"
   - You should be redirected to the success page

5. **Check your subscription:**
   - Go to [http://localhost:3000/subscription](http://localhost:3000/subscription)
   - You should see your active subscription

### Test Webhooks

In a separate terminal (while `stripe listen` is running), trigger test events:

```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated

# Test successful payment
stripe trigger invoice.payment_succeeded
```

Check your server logs to see the webhook events being received.

---

## 📊 View Your Data

### Prisma Studio

```bash
npm run studio
```

Open [http://localhost:5555](http://localhost:5555) to view:
- Plans
- Subscriptions
- Payments

### Stripe Dashboard

Go to [Dashboard → Payments](https://dashboard.stripe.com/test/payments) to see test payments.

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'stripe'"

**Solution:** Run `npm install stripe`

### Error: "STRIPE_SECRET_KEY is not set"

**Solution:** Check your `.env` file has the correct Stripe keys

### Webhook not receiving events

**Solution:**
1. Make sure `stripe listen` is running
2. Restart your dev server after adding `STRIPE_WEBHOOK_SECRET`
3. Check that the webhook URL is correct: `http://localhost:3000/api/webhooks/stripe`

### Plans not showing on homepage

**Solution:**
1. Check you ran `npm run seed:plans`
2. Open Prisma Studio and verify plans exist
3. Check that `isActive` is `true` for all plans

### Payment fails immediately

**Solution:**
1. Use the test card `4242 4242 4242 4242`
2. Don't use real card numbers in test mode
3. Check Stripe Dashboard for error details

---

## 🚀 Production Deployment

When you're ready to go live:

### 1. Switch to Live Mode

1. Go to [Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys)
2. Toggle to **"Live mode"**
3. Copy your **Live keys** (they start with `pk_live_` and `sk_live_`)

### 2. Create Live Products

Repeat Step 4 in **Live mode** to create your products and prices.

### 3. Update Production Environment Variables

On your production server (Vercel, Netlify, etc.):

```env
STRIPE_SECRET_KEY=sk_live_YourLiveSecretKey...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YourLivePublishableKey...
STRIPE_WEBHOOK_SECRET=whsec_YourProductionWebhookSecret...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Set Up Production Webhook

1. Go to [Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"+ Add endpoint"**
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** and add to your production environment

### 5. Update Seed Script with Live IDs

Update `scripts/seed-plans.ts` with your **live** Stripe Price IDs and Product IDs.

### 6. Run Migrations on Production

```bash
# On your production database
npx prisma migrate deploy
npm run seed:plans
```

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Detailed technical documentation
- [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) - File structure reference

---

## ✅ Checklist

- [ ] Install stripe package
- [ ] Create Stripe account
- [ ] Get API keys
- [ ] Add environment variables
- [ ] Create 3 products in Stripe Dashboard
- [ ] Create 6 prices (2 per product)
- [ ] Copy all Price IDs and Product IDs
- [ ] Update `seed-plans.ts` with real IDs
- [ ] Run database migrations
- [ ] Seed database with plans
- [ ] Install Stripe CLI
- [ ] Set up webhook forwarding
- [ ] Add webhook secret to `.env`
- [ ] Test payment flow end-to-end

---

## 🎊 You're Done!

Your SAAS boilerplate now has a complete payment system with:
- ✅ Beautiful pricing page
- ✅ Secure checkout flow
- ✅ Subscription management
- ✅ Automated billing
- ✅ Webhook event handling

**Need help?** Check the [STRIPE_SETUP.md](./STRIPE_SETUP.md) for more details.
