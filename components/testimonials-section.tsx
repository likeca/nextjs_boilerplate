const testimonials = [
  {
    quote: "This boilerplate saved me weeks of setup time. The auth system alone would have taken days to implement properly.",
    author: "Sarah Chen",
    role: "Founder, TechStartup",
    initials: "SC",
  },
  {
    quote: "Everything works out of the box. Stripe integration, role-based access, email templates \u2014 it\u2019s all there.",
    author: "Marcus Johnson",
    role: "CTO, SaaSCo",
    initials: "MJ",
  },
  {
    quote: "The code quality is excellent. TypeScript throughout, clean architecture, and great documentation.",
    author: "Priya Patel",
    role: "Senior Developer",
    initials: "PP",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by developers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what builders are saying about our boilerplate.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <blockquote className="text-sm text-muted-foreground leading-relaxed mb-4">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
