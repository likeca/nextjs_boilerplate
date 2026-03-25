"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6 text-center rounded-lg border border-destructive/20 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">
            Something went wrong rendering this section
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
