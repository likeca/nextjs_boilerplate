# Next.js SaaS Boilerplate

A production-ready SaaS starter kit built with Next.js 16, featuring authentication, payments, admin dashboard, blog CMS, and everything you need to launch your product fast.

## ✨ Features

- **Authentication** — Email/password, OTP verification, OAuth (Google, GitHub), 2FA (TOTP)
- **Payments** — Stripe integration with subscriptions, webhooks, and billing portal
- **Admin Dashboard** — User management, roles/permissions, blog CMS, settings
- **Email** — Transactional emails with beautiful HTML templates (password reset, OTP, receipts)
- **Blog** — Full CMS with admin editor and public blog pages
- **Security** — Rate limiting, security headers, audit logging, RBAC
- **SEO** — Sitemap, robots.txt, Open Graph, Twitter Cards
- **Dark Mode** — System/light/dark theme support
- **TypeScript** — Fully typed with Prisma ORM and Zod validation
- **Analytics** — PostHog, Plausible, or GA4 support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)

### 1. Clone and install
```bash
git clone https://github.com/habibjutt/nextjs_boilerplate.git
cd nextjs_boilerplate
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#-environment-variables) below).

### 3. Set up database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📋 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# App
NEXT_PUBLIC_APP_NAME="My SaaS App"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Auth (required)
BETTER_AUTH_SECRET="your-secret-at-least-32-chars-long"
BETTER_AUTH_URL="http://localhost:3000"

# Stripe (required for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email / SMTP (required for auth emails)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user@example.com"
SMTP_PASSWORD="your-password"
EMAIL_FROM="noreply@example.com"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma 7 |
| Auth | better-auth |
| Payments | Stripe |
| UI | Tailwind CSS v4 + shadcn/ui |
| Email | Nodemailer + HTML templates |
| Validation | Zod |

## 📁 Project Structure

```
app/
├── (protected)/     # Auth-required routes
│   └── (admin)/     # Admin panel pages
├── api/             # API routes
├── blog/            # Public blog
├── contact/         # Contact page
└── page.tsx         # Homepage

components/
├── ui/              # shadcn/ui base components
└── *.tsx            # Feature components

lib/
├── auth.ts          # better-auth configuration
├── prisma.ts        # Prisma client
├── config.ts        # App configuration
├── email-service.ts # Email sending
└── security/        # Rate limiting, audit logging

prisma/
└── schema.prisma    # Database schema
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```bash
docker build -t saas-app .
docker run -p 3000:3000 --env-file .env saas-app
```

## 📝 Creating an Admin User

After setting up the database, create your first admin user:

```bash
npm run setup:admin
```

Or use the signup page and manually set `isAdmin: true` in the database via:

```bash
npx prisma studio
```

## 🔐 Security Features

- Security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting on auth endpoints
- RBAC (roles and permissions)
- Audit logging
- Session management
- Email verification required

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

## 📧 Support

- **GitHub Issues** — Open an issue for bugs or feature requests
- **Email** — habibjutt868@gmail.com

---

⭐ If you find this boilerplate helpful, please star the repository!
