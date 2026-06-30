import { prisma } from '@/lib/prisma';
import ContestantCard from '@/components/ContestantCard';
import CountdownTimer from '@/components/CountdownTimer';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch the active event with its contestants
  const event = await prisma.event.findFirst({
    where: { isActive: true },
    include: {
      contestants: {
        orderBy: { totalVotes: 'desc' },
      },
    },
  });

  // No active event
  if (!event) {
    return (
      <div className={styles.noEvent}>
        <div className={styles.noEventIcon}>👑</div>
        <h1 className={styles.noEventTitle}>Coming Soon</h1>
        <p className={styles.noEventText}>
          There are no active voting events at the moment. Check back soon for
          the next Little Miss Nigeria competition!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Voting is Live
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleAccent}>{event.title}</span>
          </h1>
          {event.description && (
            <p className={styles.heroDescription}>{event.description}</p>
          )}
          <div className={styles.countdownWrapper}>
            <span className={styles.countdownLabel}>Voting Ends In</span>
            <CountdownTimer endDate={event.endDate.toISOString()} />
          </div>
        </div>
      </section>

      {/* Contestants Section */}
      <section className={styles.contestantsSection} id="contestants">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Meet Our Contestants</h2>
            <p className={styles.sectionSubtitle}>
              Choose your favorite and cast your vote to help them win the crown
            </p>
            <div className={styles.sectionDivider} />
          </div>

          {event.contestants.length > 0 ? (
            <div className={styles.contestantsGrid}>
              {event.contestants.map((contestant) => (
                <ContestantCard
                  key={contestant.id}
                  id={contestant.id}
                  name={contestant.name}
                  imageUrl={contestant.imageUrl}
                  totalVotes={contestant.totalVotes}
                  bio={contestant.bio}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎭</div>
              <h3 className={styles.emptyTitle}>No Contestants Yet</h3>
              <p className={styles.emptyText}>
                Contestants will be announced soon. Stay tuned!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
