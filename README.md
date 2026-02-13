# 🚀 Next.js SaaS Boilerplate

A modern, production-ready SaaS boilerplate built with Next.js 16, Better Auth, Prisma, and Shadcn UI. Features a complete role-based access control (RBAC) system with users, roles, permissions, settings management, and fully customizable branding through environment variables.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlog.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-Latest-orange?style=flat-square)](https://www.better-auth.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Latest-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## Table of Contents

- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Authentication Flow](#-authentication-flow)
- [Customization](#-customization)
- [Security Features](#-security-features)
- [Database Schema](#-database-schema)
- [RBAC System](#-role-based-access-control-rbac)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
## 🎯 Why This Boilerplate?

**Production-Ready from Day One**
- ✅ Complete authentication system with Better Auth
- ✅ Full RBAC (Role-Based Access Control) implementation
- ✅ Admin panel with user, role, and permission management
- ✅ Responsive design with modern UI components
- ✅ Type-safe with TypeScript end-to-end

## �📸 Screenshots

### Frontend
![Frontend Screenshot](public/frontend_screenshot.png)

### Admin Dashboard
![Admin Dashboard Screenshot](public/admin_screenshot.png)

## ✨ Features

### 🔐 Authentication & Security
- **Better Auth Integration** - Modern, type-safe authentication with PostgreSQL adapter
- **Email/Password Authentication** - Secure credential-based login
- **Google OAuth** - One-click social authentication (auto-disabled without credentials)
- **Protected Routes** - Route group-based authentication with server-side checks
- **Session Management** - Secure session handling with database storage
- **Password Management** - Change password with session revocation option
- **Forgot Password Flow** - Password reset via email
- **Session Revocation** - Log out from all devices option

### 👤 User Management
- **User Dashboard** - Personalized user dashboard with sidebar navigation
- **Profile Management** - Complete profile page with tabs for information and security
  - Update name, email, phone, and avatar
  - Email verification status indicator
  - User ID display (read-only)
  - Avatar with initials fallback
- **Password Change** - Secure password update with current password verification
  - Password strength requirements (min 8 characters)
  - Show/hide password toggle
  - Password confirmation validation
  - Optional session revocation (log out all other devices)
  - Fully integrated with Better Auth
- **Session Control** - Log out from all devices option
- **User CRUD** - Complete user management (create, read, update, delete)
- **User Listing** - Searchable and filterable user table with pagination
- **Role Assignment** - Assign roles to users

### � Payment & Subscriptions (Stripe)
- **Stripe Integration** - Full payment processing with Stripe
- **Subscription Plans** - Multiple pricing tiers (Starter, Professional, Enterprise)
- **Monthly & Yearly Billing** - Toggle between billing intervals with discount badges
- **Pricing Page** - Beautiful pricing cards on homepage with feature comparison
- **Authentication Required** - Users must be logged in to purchase
- **Checkout Sessions** - Secure Stripe checkout flow
- **Webhook Integration** - Automated subscription management via Stripe webhooks
- **Subscription Management** - View and manage active subscriptions
- **Payment History** - Track all payments and transactions
- **Auto-renewal** - Automatic subscription renewals
- **Cancellation Support** - Cancel subscriptions at period end
- **Success/Cancel Pages** - User-friendly payment flow pages
- **Database Tracking** - All subscriptions and payments stored in database
- **Customer Management** - Automatic Stripe customer creation and linking
- **See [STRIPE_SETUP.md](STRIPE_SETUP.md) for setup instructions**

### �🔐 Role-Based Access Control (RBAC)
- **Two-Tier Permission System** - `isAdmin` flag for admin page access + role-based permissions for actions
- **Role Management** - Create and manage roles with granular permissions
- **Permission System** - Resource-action based permissions (e.g., `user:create`, `role:update`)
- **System Roles** - Protected system roles that cannot be deleted
- **16 Built-in Permissions** - Full CRUD for users, roles, permissions, and settings
- **Admin Setup Script** - Creates Super Admin role with all permissions automatically

### 🎨 UI & Design
- **Shadcn UI Components** - Beautiful, accessible component library
- **Radix UI Primitives** - Unstyled, accessible components
- **Tailwind CSS** - Utility-first CSS framework
- **Sidebar Navigation** - Collapsible sidebar with nested menus
- **Data Tables** - Sortable, searchable tables with pagination
- **Responsive Design** - Mobile-first approach
- **Toast Notifications** - User feedback with Sonner
- **Custom Branding** - Fully customizable via environment variables:
  - App name and description
  - Logo text (2-3 characters)
  - Logo icon (any Lucide icon)
  - No code changes required for branding updates

### 🗄️ Database
- **Prisma ORM** - Type-safe database client with PostgreSQL adapter (`@prisma/adapter-pg`)
- **PostgreSQL** - Production-ready database (Neon compatible)
- **Migration System** - Version-controlled schema changes
- **Better Auth Tables** - Pre-configured user, session, account, and verification tables
- **RBAC Tables** - Role, Permission, RolePermission junction table
- **Settings Table** - Key-value settings storage
- **Audit Logging** - Log table for tracking important events
- **Enhanced User Model** - Includes phone, avatar, roleId, and isAdmin flag

### 🛠️ Developer Experience
- **TypeScript** - Full type safety
- **App Router** - Next.js 16 App Router with React 19
- **Server Actions** - Type-safe server actions for data mutations
- **ESLint** - Code linting
- **Environment Variables** - Easy configuration with comprehensive .env.example
- **Component-based Architecture** - Reusable, modular components
- **API Routes** - Built-in API endpoints (auth, user profile)
- **Utility Scripts** - Management tools:
  - `create-admin.ts` - Create admin with Super Admin role
  - `delete-user.ts` - Delete user by email
  - `check-users.ts` - View all users in database
- **Comprehensive Documentation** - Step-by-step guides for setup, customization, and features

## 🏗️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (React 19)
- **Authentication:** [Better Auth](https://www.better-auth.com/)
- **Payments:** [Stripe](https://stripe.com/)
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
git clone https://github.com/yourusername/nextjs-admin-boilerplate.git
cd nextjs-admin-boilerplate
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# App Configuration (Required)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="My SaaS App"
NEXT_PUBLIC_APP_DESCRIPTION="Your SaaS Application"

# Branding (Optional - defaults provided)
NEXT_PUBLIC_LOGO_TEXT="SA"
NEXT_PUBLIC_LOGO_ICON="GalleryVerticalEnd"

# Better Auth Secret (Required)
BETTER_AUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional - Google login will be disabled if not provided)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Note**: A complete `.env.example` file is included in the repository with all available options.
BETTER_AUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
```
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
```

**Generate Better Auth Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or using OpenSSL:

```bash
openssl rand -base64 32
```

### 4. Set Up the Database

Run Prisma migrations:

```bash
npx prisma migrate dev
# or
bunx prisma migrate dev
```

### 5. Create Admin Account

Create your first admin user:

```bash
npm run setup:admin
# or
bun run setup:admin
```

Follow the interactive prompts to enter:
- Admin name
- Admin email
- Admin password

The script will:
- Create or retrieve the **Super Admin** system role
- Create all 16 permissions (user, role, permission, setting × CRUD)
- Assign all permissions to the Super Admin role
- Create an admin user with `isAdmin: true` and assigned to Super Admin role
- Hash and securely store the password
- Mark the email as verified

**Note:** If the email already exists, you'll be given the option to promote that user to admin and assign the Super Admin role.

### 6. Run the Development Server

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
│   │   ├── (admin)/          # Admin-only routes
│   │   │   ├── dashboard/    # Admin dashboard
│   │   │   ├── account/      # User CRUD management
│   │   │   ├── roles/        # Role management
│   │   │   ├── permissions/  # Permission management
│   │   │   └── settings/     # Settings management
│   │   ├── profile/          # User profile & password change
│   │   └── layout.tsx        # Protected layout with sidebar
│   ├── api/
│   │   ├── auth/             # Better Auth API routes
│   │   └── user/profile/     # Profile API endpoints
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # Shadcn UI components
│   ├── app-sidebar.tsx       # Main sidebar navigation
│   ├── nav-main.tsx          # Navigation menu with collapsible items
│   ├── data-table.tsx        # Reusable data table component
│   ├── login-form.tsx
│   ├── signup-form.tsx
│   ├── profile-form.tsx
│   └── password-change-form.tsx
├── lib/
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client
│   ├── auth-helpers.ts       # requireAuth, requirePermission helpers
│   ├── permissions.ts        # Permission checking logic
│   ├── check-permission.ts   # Server action for client permission checks
│   ├── db.ts                 # Database client wrapper
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Utility functions
├── hooks/
│   └── use-permission.ts     # Client hook for permission checking
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── scripts/
│   ├── create-admin.ts       # Create admin with Super Admin role
│   └── delete-user.ts        # Delete user by email
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

The boilerplate is fully customizable without touching code! Update environment variables in `.env`:

### Branding

```env
# App Information
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_DESCRIPTION="Your SaaS Application"

# Logo (appears in sidebar, login, signup)
NEXT_PUBLIC_LOGO_TEXT="YA"  # 2-3 characters recommended
NEXT_PUBLIC_LOGO_ICON="GalleryVerticalEnd"  # Any Lucide icon name
```

**Available Lucide Icons**: Visit [lucide.dev/icons](https://lucide.dev/icons) for all available icon names.

**Where branding appears**:
- App name: Browser title, dashboard header, home page
- Logo: Sidebar, header, authentication pages

No code changes required - just update `.env` and restart the dev server!

### Components

All UI components are located in `components/ui/` and can be customized using Tailwind classes. The boilerplate uses Shadcn UI components which are fully customizable.

## �️ Management Utilities

The boilerplate includes helpful scripts in the `scripts/` directory for common administrative tasks:

### Create Admin User

Create a new admin user with Super Admin role and all permissions:

```bash
npm run setup:admin
# or
bun run setup:admin
# or directly
npx tsx scripts/create-admin.ts
```

**What it does:**
- Creates or retrieves the Super Admin system role
- Creates all 16 CRUD permissions (user, role, permission, setting)
- Assigns all permissions to the Super Admin role
- Creates a new admin user with `isAdmin: true`
- Assigns the Super Admin role to the user
- Hashes and stores password securely
- Marks email as verified

**Interactive prompts for:**
- Admin name
- Admin email
- Admin password

If the email already exists, you'll have the option to promote that user to admin.

### Delete User

Remove a user from the database by email:

```bash
npx tsx scripts/delete-user.ts user@example.com
```

**Safety features:**
- Requires email confirmation before deletion
- Shows user details before proceeding
- Permanently removes user and associated data

### Check Users

View all users in the database (useful for debugging):

```bash
npx tsx scripts/check-users.ts
```

**Displays:**
- User ID
- Name
- Email
- Is Admin status
- Role information
- Email verification status

## �🔒 Security Features

- **Secure Password Hashing** - Better Auth handles password encryption
- **Session Management** - Database-backed sessions with expiration
- **CSRF Protection** - Built-in protection against CSRF attacks
- **Environment Variables** - Sensitive data stored in env files
- **Protected API Routes** - Server-side authentication checks
- **Password Requirements** - Minimum 8 characters enforced

## 📊 Database Schema

The boilerplate includes pre-configured tables:

- **User** - User profiles with roleId, isAdmin flag, phone, avatar
- **Role** - User roles with isSystem flag (system roles cannot be deleted)
- **Permission** - Granular permissions (resource + action, e.g., `user:create`)
- **RolePermission** - Many-to-many junction table between roles and permissions
- **Setting** - Key-value settings storage
- **Session** - Active user sessions
- **Account** - Authentication providers and credentials
- **Verification** - Email verification tokens
- **Log** - Application logs

## 🔐 Role-Based Access Control (RBAC)

### Two-Tier Permission System

The boilerplate implements a sophisticated two-tier permission system:

**Tier 1: Admin Page Access**
- `isAdmin` flag on User model
- Controls access to all admin pages (dashboard, users, roles, permissions, settings)
- Users without `isAdmin: true` cannot access protected routes

**Tier 2: Role-Based Permissions**
- Granular CRUD permissions for specific actions
- Format: `resource:action` (e.g., `user:create`, `role:update`, `permission:delete`)
- 16 built-in permissions across 4 resources:
  - **user**: create, read, update, delete
  - **role**: create, read, update, delete
  - **permission**: create, read, update, delete
  - **setting**: create, read, update, delete

### Super Admin Role

The `create-admin.ts` script automatically creates:
- A Super Admin role with `isSystem: true`
- All 16 permissions assigned to the role
- Admin user with `isAdmin: true` and assigned to Super Admin role

### Permission Checking

**Server-side (Recommended):**
```typescript
import { requireAuth, requirePermission } from "@/lib/auth-helpers";

// Check admin access
const { user } = await requireAuth();

// Check specific permission
await requirePermission("user", "create");
```

**Client-side:**
```typescript
import { usePermission } from "@/hooks/use-permission";

function MyComponent() {
  const { hasPermission, isLoading } = usePermission("user", "delete");
  
  if (!hasPermission) return null;
  return <DeleteButton />;
}
```

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

- [x] Admin dashboard
- [x] User roles & permissions
- [x] Role-based access control (RBAC)
- [x] Settings management
- [x] Profile management with tabs
- [x] Password change with session revocation
- [x] Full branding customization via env variables
- [x] Forgot password flow
- [ ] Email verification flow
- [ ] Password reset email sending
- [ ] Two-factor authentication (2FA)
- [ ] Team/Organization support
- [ ] Subscription & payment integration (Stripe)
- [ ] API key management
- [ ] Enhanced audit logs with user tracking
- [ ] Email notifications system
- [ ] Multi-tenancy support
- [ ] Dark mode toggle

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

## 📧 Support

Need help? Here's how to get support:

1. **Check README** - Review this README for complete setup and feature documentation
2. **GitHub Issues** - Open an issue on GitHub for bugs or feature requests
3. **Email** - Contact habibjutt868@gmail.com for direct support

### Helpful Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)

---

**Built with ❤️ using Next.js**

⭐ If you find this boilerplate helpful, please star the repository!
