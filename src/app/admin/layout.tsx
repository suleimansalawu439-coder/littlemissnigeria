import AdminSidebar from './AdminSidebar';
import styles from './layout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
