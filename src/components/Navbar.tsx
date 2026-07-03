'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Hide Navbar completely on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.navbarInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon}>♛</span>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Little Miss Nigeria</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className={styles.desktopNav}>
            <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
              Home
            </Link>
            <Link href="/#contestants" className={styles.navLink}>
              Contestants
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className={`${styles.mobileToggle} ${isMobileMenuOpen ? styles.open : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.open : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div className={styles.mobileDrawer} onClick={e => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <span className={styles.brandIcon}>♛</span>
            <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)}>✕</button>
          </div>
          <div className={styles.mobileNav}>
            <Link href="/" className={styles.mobileNavLink}>
              Home
            </Link>
            <Link href="/#contestants" className={styles.mobileNavLink}>
              Contestants
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
