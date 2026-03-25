import { createAuthClient } from "better-auth/react";
import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";

const isTwoFactorEnabled = process.env.NEXT_PUBLIC_ENABLE_TWO_FACTOR !== "false";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    emailOTPClient(),
    ...(isTwoFactorEnabled ? [twoFactorClient()] : []),
  ],
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession, 
  changePassword,
  emailOtp,
} = authClient;
