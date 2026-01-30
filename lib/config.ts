// App configuration from environment variables
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
} as const;
