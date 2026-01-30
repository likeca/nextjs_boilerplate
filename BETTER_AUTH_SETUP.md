# Better Auth Setup Guide

This project now has **better-auth** integrated for authentication. Follow the steps below to complete the setup.

## ✅ Completed Setup

The following have already been configured:

- ✅ better-auth package installed
- ✅ Prisma schema updated with User, Session, Account, and Verification tables
- ✅ Server-side auth configuration ([lib/auth.ts](lib/auth.ts))
- ✅ Client-side auth utilities ([lib/auth-client.ts](lib/auth-client.ts))
- ✅ API route handler ([app/api/auth/[...all]/route.ts](app/api/auth/[...all]/route.ts))
- ✅ Login form integrated with better-auth ([components/login-form.tsx](components/login-form.tsx))
- ✅ Signup form integrated with better-auth ([components/signup-form.tsx](components/signup-form.tsx))

## 🔧 Required Setup Steps

### 1. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mobile_expense_db"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Better Auth - Generate a secure secret
BETTER_AUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Generate Better Auth Secret

Generate a secure secret key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and set it as `BETTER_AUTH_SECRET` in your `.env` file.

### 3. Set Up Google OAuth (Optional)

If you want Google sign-in to work:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set the authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
6. Copy the **Client ID** and **Client Secret** to your `.env` file

For production, add your production URL to the authorized redirect URIs.

### 4. Run Database Migration

Apply the Prisma schema to your database:

```bash
npx prisma migrate dev --name add_better_auth_tables
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Start the Development Server

```bash
npm run dev
```

## 📝 Features Implemented

### Email/Password Authentication

- Sign up with email, password, and full name
- Login with email and password
- Password validation (minimum 8 characters)
- Password confirmation on signup

### Social Authentication

- Google OAuth login (requires Google credentials)
- Apple login button (currently disabled, can be configured similarly)

### User Experience

- Loading states on form submissions
- Toast notifications for success/error messages
- Automatic redirect after successful login/signup
- Form validation

## 🎯 Next Steps (Optional)

Consider adding these features:

1. **Password Reset**: Implement forgot password functionality
2. **Email Verification**: Verify user email addresses
3. **Session Management**: Add logout functionality and session display
4. **Protected Routes**: Create middleware to protect authenticated routes
5. **User Profile**: Display logged-in user information
6. **Additional OAuth Providers**: Add GitHub, Facebook, etc.

## 📚 Documentation

- [Better Auth Documentation](https://www.better-auth.com/)
- [Better Auth with Next.js](https://www.better-auth.com/docs/installation#nextjs-app-router)
- [Better Auth Prisma Integration](https://www.better-auth.com/docs/integrations/prisma)

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Use strong, randomly generated secrets in production
- Enable HTTPS in production
- Regularly update dependencies for security patches
- Store sensitive credentials securely (use services like Vercel Environment Variables for production)

## 🐛 Troubleshooting

### Database Connection Errors

Make sure your `DATABASE_URL` is correct and the database server is running.

### OAuth Redirect Errors

Ensure the callback URL in your OAuth provider settings matches:
- Development: `http://localhost:3000/api/auth/callback/[provider]`
- Production: `https://your-domain.com/api/auth/callback/[provider]`

### Session Issues

If sessions aren't persisting, verify that:
1. `BETTER_AUTH_SECRET` is set
2. `NEXT_PUBLIC_APP_URL` matches your app's URL
3. Cookies are enabled in your browser
