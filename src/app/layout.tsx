import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Little Miss Nigeria | Online Voting Platform",
  description:
    "Vote for your favorite contestants in the Little Miss Nigeria beauty pageant. A premium online voting platform.",
  keywords: ["Little Miss Nigeria", "beauty pageant", "voting", "Nigeria"],
  openGraph: {
    title: "Little Miss Nigeria | Online Voting Platform",
    description:
      "Vote for your favorite contestants in the Little Miss Nigeria beauty pageant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-inner">
            <Link href="/" className="navbar-brand">
              <span className="navbar-brand-icon">♛</span>
              <span className="text-gradient">LMN</span>
            </Link>
            <div className="navbar-nav">
              <Link href="/" className="navbar-link">
                Home
              </Link>
              <Link href="/#contestants" className="navbar-link">
                Contestants
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">Little Miss Nigeria</div>
            <div className="footer-divider" />
            <p className="footer-text">
              The premier online voting platform for Nigeria&apos;s most
              prestigious beauty pageant.
            </p>
            <div className="footer-links">
              <Link href="/" className="footer-link">
                Home
              </Link>
              <Link href="/#contestants" className="footer-link">
                Contestants
              </Link>
            </div>
            <div className="footer-bottom">
              © {new Date().getFullYear()} Little Miss Nigeria. All rights
              reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
