# 🚀 Next.js SaaS Boilerplate

A modern, production-ready SaaS boilerplate built with Next.js 16, Better Auth, Prisma, and Shadcn UI. Get your SaaS up and running in minutes, not weeks.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## ✨ Features

### 🔐 Authentication & Security
- **Better Auth Integration** - Modern, type-safe authentication
- **Email/Password Authentication** - Secure credential-based login
- **Google OAuth** - One-click social authentication
- **Protected Routes** - Route group-based authentication
- **Session Management** - Secure session handling with database storage
- **Password Management** - Change password with session revocation option

### 👤 User Management
- **User Dashboard** - Personalized user dashboard
- **Profile Management** - Update name, email, and avatar
- **Password Change** - Secure password update with current password verification
- **Email Verification Status** - Track email verification state
- **Session Control** - Log out from all devices option

### 🎨 UI & Design
- **Shadcn UI Components** - Beautiful, accessible component library
- **Radix UI Primitives** - Unstyled, accessible components
- **Tailwind CSS** - Utility-first CSS framework
- **Dark/Light Theme Support** - Built-in theme switching (ready to implement)
- **Responsive Design** - Mobile-first approach
- **Toast Notifications** - User feedback with Sonner
- **Custom Branding** - Environment-based configuration

### 🗄️ Database
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Production-ready database (Neon compatible)
- **Migration System** - Version-controlled schema changes
- **Better Auth Tables** - Pre-configured user, session, and account tables

### 🛠️ Developer Experience
- **TypeScript** - Full type safety
- **App Router** - Next.js 15 App Router
- **ESLint** - Code linting
- **Environment Variables** - Easy configuration
- **Component-based Architecture** - Reusable, modular components
- **API Routes** - Built-in API endpoints

## 🏗️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (React 19)
- **Authentication:** [Better Auth](https://www.better-auth.com/)
- **Database:** [Prisma](https://www.prisma.io/) + PostgreSQL
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Toast:** [Sonner](https://sonner.emilkowal.ski/)

## 📦 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (or use [Neon](https://neon.tech/))
- Google OAuth credentials (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nextjs-saas-boilerplate.git
cd nextjs-saas-boilerplate
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Your SaaS Name"
NEXT_PUBLIC_APP_DESCRIPTION="Your SaaS Application"
NEXT_PUBLIC_COMPANY_NAME="Your Company"

# Branding
NEXT_PUBLIC_LOGO_TEXT="YS"
NEXT_PUBLIC_LOGO_ICON="GalleryVerticalEnd"

# Theme
NEXT_PUBLIC_PRIMARY_COLOR="#0070f3"

# Better Auth Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
BETTER_AUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Set Up the Database

Run Prisma migrations:

```bash
npx prisma migrate dev
# or
bunx prisma migrate dev
```

### 5. Run the Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/
│   ├── (protected)/          # Protected routes with auth layout
│   │   ├── dashboard/        # User dashboard
│   │   └── profile/          # User profile & settings
│   ├── api/
│   │   ├── auth/             # Better Auth API routes
│   │   └── user/             # User management APIs
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # Shadcn UI components
│   ├── dashboard-content.tsx
│   ├── header.tsx
│   ├── footer.tsx
│   ├── login-form.tsx
│   ├── signup-form.tsx
│   ├── profile-form.tsx
│   └── password-change-form.tsx
├── lib/
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Utility functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
└── public/                   # Static assets
```

## 🔑 Authentication Flow

### Email/Password Authentication

1. **Sign Up:** `/signup` - Create account with name, email, and password
2. **Login:** `/login` - Authenticate with email and password
3. **Protected Routes:** Automatic redirect to login if not authenticated
4. **Session Management:** Server-side session validation

### Google OAuth

1. Click "Login with Google" button
2. Authenticate with Google
3. Automatic account creation and login
4. Redirect to dashboard

## 🎨 Customization

### Branding

Update environment variables in `.env`:

```env
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_LOGO_TEXT="YA"
NEXT_PUBLIC_PRIMARY_COLOR="#your-color"
```

### Theme

The boilerplate includes `next-themes` for easy theme switching. Dark mode support is ready to implement.

### Components

All UI components are located in `components/ui/` and can be customized using Tailwind classes.

## 🔒 Security Features

- **Secure Password Hashing** - Better Auth handles password encryption
- **Session Management** - Database-backed sessions with expiration
- **CSRF Protection** - Built-in protection against CSRF attacks
- **Environment Variables** - Sensitive data stored in env files
- **Protected API Routes** - Server-side authentication checks
- **Password Requirements** - Minimum 8 characters enforced

## 📊 Database Schema

The boilerplate includes pre-configured tables:

- **User** - User profiles and information
- **Session** - Active user sessions
- **Account** - Authentication providers and credentials
- **Verification** - Email verification tokens
- **Log** - Application logs (optional)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

The boilerplate works with any platform supporting Next.js:

- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted

**Important:** Make sure to:
- Set up a production PostgreSQL database
- Update `NEXT_PUBLIC_APP_URL` to your domain
- Generate a new `BETTER_AUTH_SECRET` for production

## 🛣️ Roadmap

- [ ] Email verification
- [ ] Forgot password flow
- [ ] Two-factor authentication (2FA)
- [ ] Team/Organization support
- [ ] Subscription & payment integration (Stripe)
- [ ] Admin dashboard
- [ ] API key management
- [ ] Audit logs
- [ ] User roles & permissions
- [ ] Email notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Better Auth](https://www.better-auth.com/) - Authentication for TypeScript
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable components
- [Vercel](https://vercel.com/) - Hosting platform

## 📧 Support

For support, email habibjutt868@gmail.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js**

⭐ If you find this boilerplate helpful, please star the repository!
