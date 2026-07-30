'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">Little Miss Nigeria</div>
        <div className="footer-divider" />
        <p className="footer-text">
          The premier online voting platform for Nigeria&apos;s most
          prestigious beauty pageant. Celebrating elegance, intelligence, and grace.
        </p>
        <div className="footer-links">
          {/* Links hidden during maintenance */}
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Little Miss Nigeria. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
