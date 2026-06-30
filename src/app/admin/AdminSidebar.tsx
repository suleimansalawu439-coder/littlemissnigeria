'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Settings } from 'lucide-react';
import styles from './layout.module.css';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Contestants', href: '/admin/contestants', icon: Users },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Event Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.brandRow}>
          <span className={styles.brandIcon}>👑</span>
          <div className={styles.brandText}>
            <h2>Little Miss Nigeria</h2>
            <span>Admin Panel</span>
          </div>
        </div>
      </div>

      <nav className={styles.navSection}>
        <p className={styles.navLabel}>Navigation</p>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${
                    isActive ? styles.navLinkActive : ''
                  }`}
                >
                  <Icon className={styles.navIcon} size={20} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
