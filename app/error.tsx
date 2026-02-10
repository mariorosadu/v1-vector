"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ background: '#0f0f0f', color: 'white', padding: '40px', fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Application Error</h1>
          <p style={{ marginBottom: '16px', opacity: 0.7 }}>{error.message}</p>
          <pre style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', overflow: 'auto', fontSize: '12px' }}>
            {error.stack}
          </pre>
          <button
            onClick={reset}
            style={{ marginTop: '24px', padding: '12px 24px', background: 'white', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
