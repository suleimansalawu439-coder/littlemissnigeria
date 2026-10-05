// Site shutdown notice, styled after Vercel's minimal error pages.
// This is the only public page: it is fully static, fetches nothing,
// and contains zero links.
export const metadata = {
  title: 'Subscription Expired',
  description: 'This site is no longer available.',
};

export default function SubscriptionExpiredPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily:
          'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      {/* Mark */}
      <svg
        width="48"
        height="42"
        viewBox="0 0 24 21"
        fill="none"
        aria-hidden="true"
        style={{ marginBottom: '32px' }}
      >
        <path d="M12 0L24 21H0L12 0Z" fill="#000000" />
      </svg>

      <h1
        style={{
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 600,
          letterSpacing: '-0.04em',
          margin: '0 0 16px 0',
          lineHeight: 1.2,
        }}
      >
        Subscription Expired
      </h1>

      <p
        style={{
          fontSize: '15px',
          color: '#666666',
          margin: '0 0 8px 0',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        }}
      >
        This website is no longer available.
      </p>

      <p
        style={{
          fontSize: '13px',
          color: '#999999',
          margin: 0,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        }}
      >
        ERR_SUBSCRIPTION_EXPIRED
      </p>
    </div>
  );
}
