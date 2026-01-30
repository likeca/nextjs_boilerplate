# 🎨 SaaS Bootstrap Customization Guide

Your application is now fully customizable via environment variables! All branding and configuration can be changed without touching the code.

## 📋 Environment Variables

### App Branding
```env
# Your app's display name
NEXT_PUBLIC_APP_NAME="My SaaS App"

# Short description for your app
NEXT_PUBLIC_APP_DESCRIPTION="Your SaaS Application"

# Company/brand name (used in footer, login, signup)
NEXT_PUBLIC_COMPANY_NAME="Company Inc."
```

### Logo Configuration
```env
# Short text shown in logo (2-3 characters recommended)
NEXT_PUBLIC_LOGO_TEXT="SA"

# Lucide icon name (e.g., GalleryVerticalEnd, Zap, Rocket, Building)
# See: https://lucide.dev/icons
NEXT_PUBLIC_LOGO_ICON="GalleryVerticalEnd"
```

### Theme
```env
# Primary color (hex format)
NEXT_PUBLIC_PRIMARY_COLOR="#0070f3"
```

### URLs
```env
# Your app's base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🎯 Where Branding Appears

### App Name
- Browser title/tab
- Dashboard header
- Home page hero section

### Company Name
- Login page logo
- Signup page logo
- Home page footer
- Copyright notice

### Logo
- Home page header
- Login page
- Signup page
- Dynamically uses the icon specified in `NEXT_PUBLIC_LOGO_ICON`

## 🔧 Customization Examples

### Example 1: Expense Tracker
```env
NEXT_PUBLIC_APP_NAME="Expense Tracker"
NEXT_PUBLIC_APP_DESCRIPTION="Manage your expenses efficiently"
NEXT_PUBLIC_COMPANY_NAME="Expense Tracker Inc."
NEXT_PUBLIC_LOGO_TEXT="ET"
NEXT_PUBLIC_LOGO_ICON="Wallet"
NEXT_PUBLIC_PRIMARY_COLOR="#10b981"
```

### Example 2: Project Manager
```env
NEXT_PUBLIC_APP_NAME="TaskFlow"
NEXT_PUBLIC_APP_DESCRIPTION="Streamline your project management"
NEXT_PUBLIC_COMPANY_NAME="TaskFlow Ltd."
NEXT_PUBLIC_LOGO_TEXT="TF"
NEXT_PUBLIC_LOGO_ICON="CheckSquare"
NEXT_PUBLIC_PRIMARY_COLOR="#8b5cf6"
```

### Example 3: Analytics Platform
```env
NEXT_PUBLIC_APP_NAME="DataViz Pro"
NEXT_PUBLIC_APP_DESCRIPTION="Turn data into insights"
NEXT_PUBLIC_COMPANY_NAME="DataViz Inc."
NEXT_PUBLIC_LOGO_TEXT="DV"
NEXT_PUBLIC_LOGO_ICON="BarChart3"
NEXT_PUBLIC_PRIMARY_COLOR="#f59e0b"
```

## 📦 Configuration File

All configuration is centralized in [`lib/config.ts`](lib/config.ts):

```typescript
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "My SaaS App",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Your SaaS Application",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  logo: {
    text: process.env.NEXT_PUBLIC_LOGO_TEXT || "SA",
    icon: process.env.NEXT_PUBLIC_LOGO_ICON || "GalleryVerticalEnd",
  },
  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "Company Inc.",
  },
  theme: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#0070f3",
  },
}
```

## 🎨 Logo Component

The reusable [`Logo` component](components/logo.tsx) automatically:
- Loads the correct Lucide icon
- Displays the company name
- Creates a link to home page
- Adapts to light/dark themes

Usage:
```tsx
import { Logo } from "@/components/logo"

// Default (with text and link to home)
<Logo />

// Without text
<Logo showText={false} />

// Custom link
<Logo href="/dashboard" />

// Custom styling
<Logo className="text-xl" />
```

## 🎯 Available Lucide Icons

Popular icon choices for SaaS apps:
- `Zap` - Fast, energy
- `Rocket` - Growth, launch
- `Building` - Enterprise, business
- `Sparkles` - Premium, AI
- `Layers` - Stack, layers
- `Box` - Product, package
- `Cpu` - Tech, processing
- `Database` - Data, storage
- `BarChart3` - Analytics
- `Wallet` - Finance
- `ShoppingCart` - E-commerce
- `Users` - Team, collaboration
- `Mail` - Communication
- `Calendar` - Scheduling
- `CheckSquare` - Tasks, todos

Browse all icons: https://lucide.dev/icons

## 🚀 Quick Start

1. **Copy `.env.example` to `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Customize your branding** in `.env`

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

4. **Visit your app** at http://localhost:3000

## 📝 Files Updated

These files now use environment variables:

- ✅ `app/layout.tsx` - Page title and description
- ✅ `app/page.tsx` - Home page with branding
- ✅ `app/login/page.tsx` - Login page
- ✅ `app/signup/page.tsx` - Signup page
- ✅ `components/dashboard-content.tsx` - Dashboard header
- ✅ `components/logo.tsx` - Reusable logo component
- ✅ `lib/config.ts` - Centralized configuration
- ✅ `.env.example` - Template with all variables
- ✅ `.env` - Your local configuration

## 🎨 Further Customization

### Custom Logo Image
To use a custom image instead of an icon:

1. Add your logo to `public/logo.png`
2. Update `components/logo.tsx`:
   ```tsx
   import Image from "next/image"
   
   // Replace the icon with:
   <Image src="/logo.png" alt="Logo" width={24} height={24} />
   ```

### Theme Colors
To customize more colors, extend `lib/config.ts`:
```typescript
export const appConfig = {
  // ... existing config
  theme: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#0070f3",
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#6366f1",
    accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || "#ec4899",
  },
}
```

### Fonts
The app uses Geist Sans and Geist Mono. To change fonts, update `app/layout.tsx`.

## 🔒 Important Notes

- ✅ All `NEXT_PUBLIC_*` variables are safe for client-side code
- ✅ Never commit `.env` to version control (already in `.gitignore`)
- ✅ Always use `.env.example` as a template
- ✅ Restart dev server after changing environment variables
- ✅ For production, set environment variables in your hosting platform

## 🎉 You're All Set!

Your SaaS bootstrap is now fully customizable. Just update the `.env` file and you're ready to launch your branded application!
