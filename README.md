# 🚀 Next.js Admin Boilerplate

A modern, production-ready admin dashboard boilerplate built with Next.js 16, Better Auth, Prisma, and Shadcn UI. Features a complete role-based access control (RBAC) system with users, roles, permissions, and settings management.

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
- **User Dashboard** - Personalized user dashboard with sidebar navigation
- **Profile Management** - Update name, email, phone, and avatar
- **Password Change** - Secure password update with current password verification
- **Session Control** - Log out from all devices option
- **User CRUD** - Complete user management (create, read, update, delete)
- **User Listing** - Searchable and filterable user table with pagination
- **Role Assignment** - Assign roles to users

### 🔐 Role-Based Access Control (RBAC)
- **Two-Tier Permission System** - `isAdmin` flag for admin page access + role-based permissions for actions
- **Role Management** - Create and manage roles with granular permissions
- **Permission System** - Resource-action based permissions (e.g., `user:create`, `role:update`)
- **Sidebar Navigation** - Collapsible sidebar with nested menus
- **Data Tables** - Sortable, searchable tables with pagination
- **16 Built-in Permissions** - Full CRUD for users, roles, permissions, and settings
- **Admin Setup Script** - Creates Super Admin role with all permissions automatically

### 🎨 UI & Design
- **Shadcn UI Components** - Beautiful, acce with PostgreSQL adapter
- **PostgreSQL** - Production-ready database (Neon compatible)
- **Migration System** - Version-controlled schema changes
- **Better Auth Tables** - Pre-configured user, session, account, and verification tables
- **RBAC Tables** - Role, Permission, RolePermission junction table
- **Settings Table** - Key-value settings storage
- **Audit Logging** - Log table for tracking important event
- **Toast Notifications** - User feedback with Sonner
- **Custom Branding** - Envi6 App Router with React 19
- **Server Actions** - Type-safe server actions for data mutations
- **ESLint** - Code linting
- **Environment Variables** - Easy configuration
- **Component-based Architecture** - Reusable, modular components
- **API Routes** - Built-in API endpoints
- **Utility Scripts** - create-admin.ts, delete-user.ts for management taskbase (Neon compatible)
- **Migration System** - Version-controlled schema changes
- **Better Auth Tables** - Pre-configured user, session, and account tables
- **RBAC System** - Role-based access control with permissions

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

# Better Auth Secret
BETTER_AUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
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
- Admin eor retrieve the **Super Admin** system role
- Create all 16 permissions (user, role, permission, setting × CRUD)
- Assign all permissions to the Super Admin role
- Create an admin user with `isAdmin: true` and assigned to Super Admin role
- Hash and securely store the password
- Mark the email as verified

**Note:** If the email already exists, you'll be given the option to promote that user to admin and assign the Super Admin role
- Mark the email as verified
- Allow login immediately

**Note:** If the email already exists, you'll be given the option to promote that user to admin.

### 6. Run the Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Projec(admin)/          # Admin-only routes
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
4. *Components

All UI components are located in `components/ui/` and can be customized using Tailwind classes. The boilerplate uses Shadcn UI components which are fully customizable
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
 with roleId, isAdmin flag, phone, avatar
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

### Creating Custom Roles

1. Navigate to **Access Control > Roles**
2. Click **Create New Role**
3. Enter role name and description
4. Select permissions from the 16 available options
5. Assign users to the role in **Users** section*Permissions**: Granular permissions with resource and action
- **Flexible Authorization**: Use `isAdmin` flag or role-based permissions
x] Admin dashboard
- [x] User roles & permissions
- [x] Role-based access control (RBAC)
- [x] Settings management
- [ ] Email verification
- [ ] Forgot password flow
- [ ] Two-factor authentication (2FA)
- [ ] Team/Organization support
- [ ] Subscription & payment integration (Stripe)
- [ ] API key management
- [ ] Enhanced audit logs with user tracking
// In server components or API routes
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { isAdmin: true }
});

if (!user?.isAdmin) {
  return unauthorized();
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
