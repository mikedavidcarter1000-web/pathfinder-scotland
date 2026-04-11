export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--pf-blue-50)' }}
    >
      <div className="text-center">
        <div
          className="mx-auto"
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--pf-blue-100)',
            borderTopColor: 'var(--pf-blue-700)',
            borderRadius: '9999px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            color: 'var(--pf-grey-600)',
            marginTop: '16px',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Loading...
        </p>
      </div>
    </div>
  )
}
