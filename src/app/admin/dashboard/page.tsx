import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const event = await prisma.event.findFirst({
    where: { isActive: true },
    include: {
      contestants: {
        orderBy: { totalVotes: 'desc' },
        take: 5,
      },
    },
  });

  const allPayments = await prisma.payment.findMany({
    where: { status: 'SUCCESS' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      contestant: true,
    },
  });

  const totalVotes = event?.contestants.reduce((sum, c) => sum + c.totalVotes, 0) || 0;
  
  // Calculate total revenue from successful payments for the active event (simplified mock logic using all payments here for MVP) 
  // In reality you'd want to sum over ALL successful payments, not just `take: 5`
  const allSuccessfulPayments = await prisma.payment.findMany({
    where: { status: 'SUCCESS' },
  });
  const actualTotalRevenue = allSuccessfulPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className="heading-sm">Dashboard Overview</h1>
        {event && (
          <div className={styles.eventBadge}>
            <span className={styles.pulseDot}></span>
            Active Event: {event.title}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statIcon}>👑</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Contestants</div>
            <div className={styles.statValue}>{event?.contestants.length || 0}</div>
          </div>
        </div>
        
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statIcon}>🗳️</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Votes Cast</div>
            <div className={styles.statValue}>{totalVotes.toLocaleString()}</div>
          </div>
        </div>
        
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Revenue (₦)</div>
            <div className={styles.statValue}>{actualTotalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Leaderboard */}
        <div className={`${styles.panel} glass-card`}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Top 5 Contestants</h3>
            <span className="text-gold text-sm">Live</span>
          </div>
          <div className={styles.panelBody}>
            {event?.contestants.length ? (
              <div className={styles.leaderboardList}>
                {event.contestants.map((c, i) => (
                  <div key={c.id} className={styles.leaderboardItem}>
                    <div className={styles.rank}>#{i + 1}</div>
                    <div className={styles.contestantInfo}>
                      <div className={styles.cName}>{c.name}</div>
                      <div className={styles.cVotes}>{c.totalVotes.toLocaleString()} votes</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No contestants found.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`${styles.panel} glass-card`}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Recent Payments</h3>
            <a href="/admin/payments" className={styles.viewAll}>View All</a>
          </div>
          <div className={styles.panelBody}>
            {allPayments.length ? (
              <div className={styles.transactionList}>
                {allPayments.map(p => (
                  <div key={p.id} className={styles.transactionItem}>
                    <div className={styles.txIcon}>✓</div>
                    <div className={styles.txInfo}>
                      <div className={styles.txEmail}>{p.email}</div>
                      <div className={styles.txDesc}>Voted for {p.contestant.name}</div>
                    </div>
                    <div className={styles.txAmount}>₦{p.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No recent payments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
