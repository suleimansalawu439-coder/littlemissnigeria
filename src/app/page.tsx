import { prisma } from '@/lib/prisma';
import ContestantCard from '@/components/ContestantCard';
import CountdownTimer from '@/components/CountdownTimer';
import { isVotingOpen } from '@/lib/event';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const event = await prisma.event.findFirst({
    where: { isActive: true },
    include: {
      contestants: {
        orderBy: { totalVotes: 'desc' },
      },
    },
  });

  if (!event) {
    return (
      <div className={styles.noEvent}>
        <div className={styles.sparkle} style={{top: '20%', left: '30%'}}>✨</div>
        <div className={styles.sparkle} style={{top: '60%', right: '20%'}}>✨</div>
        <div className={styles.noEventIcon}>👑</div>
        <h1 className="heading-display text-gradient">Coming Soon</h1>
        <p className={styles.noEventText}>
          The stage is being set. There are no active voting events at the moment. 
          Check back soon for the next Little Miss Nigeria competition.
        </p>
      </div>
    );
  }

  const totalVotesCast = event.contestants.reduce((acc, c) => acc + c.totalVotes, 0);

  const votingOpen = isVotingOpen(event);
  const showVotingEndedError = searchParams?.error === 'voting_ended';

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.particlesContainer}>
          <div className={styles.particle} style={{top: '10%', left: '15%', animationDelay: '0s'}}></div>
          <div className={styles.particle} style={{top: '30%', right: '10%', animationDelay: '1s'}}></div>
          <div className={styles.particle} style={{bottom: '20%', left: '20%', animationDelay: '2s'}}></div>
          <div className={styles.particle} style={{bottom: '40%', right: '25%', animationDelay: '0.5s'}}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            {votingOpen ? 'Voting is Live' : 'Voting Ended'}
          </div>
          {showVotingEndedError && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.9rem 1.2rem',
                borderRadius: '12px',
                background: 'rgba(180, 40, 40, 0.15)',
                border: '1px solid rgba(220, 80, 80, 0.5)',
                color: '#ffd7d7',
                fontSize: '0.95rem',
                maxWidth: '560px',
              }}
            >
              Voting had ended before your payment completed. Your payment was
              received but no votes were counted — please contact support about
              a refund.
            </div>
          )}
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleAccent}>{event.title}</span>
          </h1>
          {event.description && (
            <p className={styles.heroDescription}>{event.description}</p>
          )}
          
          <div className={styles.heroStatsBox}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{event.contestants.length}</span>
              <span className={styles.heroStatLabel}>Contestants</span>
            </div>
            <div className={styles.heroStatDivider}></div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{totalVotesCast.toLocaleString()}</span>
              <span className={styles.heroStatLabel}>Total Votes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className={styles.countdownSection}>
        <div className="container flex-col flex-center">
          {votingOpen ? (
            <>
              <h3 className={styles.countdownHeading}>Voting Ends In</h3>
              <CountdownTimer endDate={event.endDate.toISOString()} />
            </>
          ) : (
            <>
              <h3 className={styles.countdownHeading}>Voting Has Ended</h3>
              <p className="text-muted" style={{ textAlign: 'center', maxWidth: '520px' }}>
                Thank you to everyone who voted and supported the contestants.
                The results will be announced soon.
              </p>
            </>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className="heading-lg" style={{marginBottom: 'var(--space-3xl)', textAlign: 'center', width: '100%'}}>How To Vote</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Choose</h3>
              <p className={styles.stepDesc}>Browse through our elegant contestants and select your favorite.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Vote</h3>
              <p className={styles.stepDesc}>Select a voting package. Every vote brings them closer to the crown.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Support</h3>
              <p className={styles.stepDesc}>Complete payment securely via Paystack. Your vote is counted instantly!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contestants Grid Section */}
      <section className={styles.contestantsSection} id="contestants">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className="heading-display">Meet The Queens</h2>
            <p className={styles.sectionSubtitle}>
              Grace, beauty, and intelligence. Choose your favorite and cast your vote.
            </p>
            <div className={styles.sectionDivider} />
          </div>

          {event.contestants.length > 0 ? (
            <div className={styles.contestantsGrid}>
              {event.contestants.map((contestant, index) => (
                <div 
                  key={contestant.id} 
                  className={styles.staggerItem}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ContestantCard
                    slug={contestant.slug}
                    name={contestant.name}
                    imageUrl={contestant.imageUrl}
                    totalVotes={contestant.totalVotes}
                    bio={contestant.bio}
                    rank={index + 1}
                    votingOpen={votingOpen}
                  />
                </div>
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
