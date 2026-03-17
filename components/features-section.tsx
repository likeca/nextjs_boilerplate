import { ShieldCheck, Zap, CreditCard, Users, Code2, BarChart3 } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Authentication Built-in",
    description: "Email/password, OTP verification, and social login. Enterprise-grade security from day one.",
  },
  {
    icon: CreditCard,
    title: "Payments Ready",
    description: "Stripe integration with subscription management, webhook handling, and billing portal.",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description: "Built on Next.js 16 with React 19 and Turbopack. Server components and optimized rendering.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Full RBAC system with roles, permissions, and admin panel for team management.",
  },
  {
    icon: Code2,
    title: "TypeScript First",
    description: "Fully typed codebase with Prisma ORM, Zod validation, and type-safe API routes.",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description: "Pre-built admin dashboard with user management, analytics, and content management.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/40" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to launch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop reinventing the wheel. Our boilerplate includes all the essential features for a production-ready SaaS.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
