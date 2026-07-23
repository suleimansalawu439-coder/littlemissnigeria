import AdminSidebar from './AdminSidebar';
import styles from './layout.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.breadcrumbs}>Admin Portal</div>
          <div className={styles.userMenu}>
            <div className={styles.avatar}>A</div>
            <span className={styles.userName}>Administrator</span>
          </div>
        </div>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
