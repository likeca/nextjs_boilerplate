// App configuration from environment variables
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "My SaaS App",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Your SaaS Application",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  logo: {
    text: process.env.NEXT_PUBLIC_LOGO_TEXT || "SA",
    icon: process.env.NEXT_PUBLIC_LOGO_ICON || "GalleryVerticalEnd",
  }
} as const;
