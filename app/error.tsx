"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          An unexpected error occurred. Our team has been notified.
          {error.digest && (
            <span className="block text-xs mt-1">Error ID: {error.digest}</span>
          )}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
