"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "16px",
            textAlign: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Critical Error</h1>
          <p style={{ color: "#666", maxWidth: "400px" }}>
            A critical error occurred. Please refresh the page or contact support.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#000",
              color: "#fff",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
