'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import styles from './AdminSidebar.module.css';

const MENU_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/contestants', label: 'Contestants', icon: '👑' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className={styles.mobileToggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Admin Menu"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>♛</span> LMN Admin
        </div>

        <nav className={styles.nav}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.link} ${isActive ? styles.activeLink : ''}`}
                onClick={() => setIsOpen(false)} // Auto-close on mobile click
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button 
            className={styles.logoutBtn}
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
