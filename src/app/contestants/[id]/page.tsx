import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import VotingForm from '@/components/VotingForm';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface ContestantPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ContestantPageProps) {
  const { id } = await params;
  const contestant = await prisma.contestant.findUnique({
    where: { id },
  });

  if (!contestant) {
    return { title: 'Contestant Not Found | Little Miss Nigeria' };
  }

  return {
    title: `Vote for ${contestant.name} | Little Miss Nigeria`,
    description: contestant.bio || `Vote for ${contestant.name} in the Little Miss Nigeria pageant.`,
  };
}

export default async function ContestantPage({ params }: ContestantPageProps) {
  const { id } = await params;

  const contestant = await prisma.contestant.findUnique({
    where: { id },
    include: {
      event: true,
    },
  });

  if (!contestant) {
    return (
      <div className="container">
        <div className={styles.notFound}>
          <div className={styles.notFoundIcon}>🔍</div>
          <h1 className={styles.notFoundTitle}>Contestant Not Found</h1>
          <p className={styles.notFoundText}>
            The contestant you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/" className={`btn btn-secondary ${styles.notFoundLink}`}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Back Link */}
        <Link href="/" className={styles.backLink}>
          <span className={styles.backArrow}>←</span>
          Back to all contestants
        </Link>

        <div className={styles.layout}>
          {/* Image Column */}
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              {contestant.imageUrl ? (
                <img
                  src={contestant.imageUrl}
                  alt={contestant.name}
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder}>👑</div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className={styles.infoColumn}>
            <h1 className={styles.contestantName}>{contestant.name}</h1>

            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {contestant.totalVotes.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Total Votes</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {contestant.event.isActive ? '🟢' : '🔴'}
                </div>
                <div className={styles.statLabel}>
                  {contestant.event.isActive ? 'Voting Open' : 'Voting Closed'}
                </div>
              </div>
            </div>

            {contestant.bio && (
              <div className={styles.bioSection}>
                <h3 className={styles.bioTitle}>About</h3>
                <p className={styles.bioText}>{contestant.bio}</p>
              </div>
            )}

            <div className={styles.divider} />

            {/* Voting Form */}
            {contestant.event.isActive && (
              <div className={styles.votingSection}>
                <VotingForm
                  contestantId={contestant.id}
                  contestantName={contestant.name}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
