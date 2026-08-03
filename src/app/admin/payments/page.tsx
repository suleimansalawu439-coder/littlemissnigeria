import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import PaymentsClient from './PaymentsClient';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      contestant: { select: { name: true } },
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Payments</h1>
        <p className={styles.pageSubtitle}>
          Full log of all voting transactions. Filter by date, status, or sort to drill down.
        </p>
      </div>

      <PaymentsClient payments={payments} />
    </div>
  );
}
