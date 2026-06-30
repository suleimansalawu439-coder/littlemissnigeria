import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import styles from './layout.module.css';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = headers();
  const pathname =
    headerList.get('x-next-pathname') ||
    headerList.get('x-invoke-path') ||
    headerList.get('next-url') ||
    '';

  const isLoginPage = pathname.includes('/admin/login');

  if (isLoginPage) {
    return <>{children}</>;
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const adminName = session.user?.name || session.user?.email || 'Admin';
  const initials = adminName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={styles.adminShell}>
      <AdminSidebar />

      <div className={styles.mainArea}>
        <header className={styles.topBar}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>{initials}</div>
            <div>
              <div className={styles.adminName}>{adminName}</div>
              <div className={styles.adminRole}>Administrator</div>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>{children}</main>
      </div>
    </div>
  );
}
