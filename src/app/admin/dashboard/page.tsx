import { prisma } from '@/lib/prisma';
import {
  DollarSign,
  Vote,
  Users,
  Receipt,
} from 'lucide-react';
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

export default async function AdminDashboardPage() {
  const [
    totalRevenueResult,
    totalVotesResult,
    totalContestants,
    totalTransactions,
    recentPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    }),
    prisma.contestant.aggregate({
      _sum: { totalVotes: true },
    }),
    prisma.contestant.count(),
    prisma.payment.count(),
    prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { contestant: { select: { name: true } } },
    }),
  ]);

  const totalRevenue = totalRevenueResult._sum.amount || 0;
  const totalVotes = totalVotesResult._sum.totalVotes || 0;

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      colorClass: styles.statIconGold,
    },
    {
      label: 'Total Votes',
      value: totalVotes.toLocaleString(),
      icon: Vote,
      colorClass: styles.statIconBlue,
    },
    {
      label: 'Contestants',
      value: totalContestants.toLocaleString(),
      icon: Users,
      colorClass: styles.statIconGreen,
    },
    {
      label: 'Transactions',
      value: totalTransactions.toLocaleString(),
      icon: Receipt,
      colorClass: styles.statIconPurple,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>
          Welcome back — here&apos;s an overview of your platform.
        </p>
      </div>

      {/* ─── Stat Cards ──────────────────────── */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{stat.label}</span>
                <div className={`${styles.statIconBox} ${stat.colorClass}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className={styles.statValue}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Recent Payments ─────────────────── */}
      <div className={styles.tableSection}>
        <div className={styles.tableSectionHeader}>
          <h2 className={styles.tableSectionTitle}>Recent Payments</h2>
        </div>

        {recentPayments.length === 0 ? (
          <div className={styles.emptyState}>No payments recorded yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Voter</th>
                <th>Contestant</th>
                <th>Amount</th>
                <th>Votes</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <span className={styles.reference}>
                      {payment.reference}
                    </span>
                  </td>
                  <td>{payment.voterName}</td>
                  <td>{payment.contestant.name}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.votesAdded}</td>
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
                  <td>{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
