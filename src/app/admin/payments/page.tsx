import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

function formatCurrency(amount: number): string {
  const amountInNaira = amount / 100;
  return '₦' + amountInNaira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

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
          Full log of all voting transactions.
        </p>
      </div>

      <div className={styles.tableSection}>
        {payments.length === 0 ? (
          <div className={styles.emptyState}>No payments recorded yet.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Voter Name</th>
                  <th>Email</th>
                  <th>Contestant</th>
                  <th>Amount</th>
                  <th>Votes</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <span className={styles.reference}>
                        {payment.reference}
                      </span>
                    </td>
                    <td>{payment.voterName}</td>
                    <td>
                      <span className={styles.email}>{payment.email}</span>
                    </td>
                    <td>
                      <span className={styles.contestantName}>
                        {payment.contestant.name}
                      </span>
                    </td>
                    <td>
                      <span className={styles.amount}>
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.votes}>
                        {payment.votesAdded}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          payment.status === 'SUCCESS'
                            ? styles.statusSuccess
                            : payment.status === 'PENDING'
                            ? styles.statusPending
                            : styles.statusFailed
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <span className={styles.date}>
                        {formatDate(payment.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
