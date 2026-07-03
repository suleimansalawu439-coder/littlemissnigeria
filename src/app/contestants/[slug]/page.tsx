import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import VotingForm from '@/components/VotingForm';
import styles from './page.module.css';
import { Metadata } from 'next';

export const revalidate = 30; // ISR for lightning fast loading


export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const contestant = await prisma.contestant.findUnique({
    where: { slug: params.slug },
  });

  if (!contestant) {
    return { title: 'Contestant Not Found | Little Miss Nigeria' };
  }

  return {
    title: `Vote for ${contestant.name} | Little Miss Nigeria`,
    description: contestant.bio || `Vote for ${contestant.name} in the Little Miss Nigeria pageant.`,
  };
}

export default async function ContestantPage({ params }: { params: { slug: string } }) {
  const contestant = await prisma.contestant.findUnique({
    where: { slug: params.slug },
    include: {
      event: true,
    },
  });

  if (!contestant) {
    return (
      <div className="container">
        <div className={styles.notFound}>
          <div className={styles.notFoundIcon}>🔍</div>
          <h1 className="heading-lg">Contestant Not Found</h1>
          <p className="text-muted">
            The contestant you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/" className="btn btn-secondary">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Back Link - Positioned Absolute or fixed depending on design */}
      <div className={styles.topNav}>
        <div className="container">
          <Link href="/#contestants" className={styles.backLink}>
            <span className={styles.backArrow}>←</span>
            Back to all contestants
          </Link>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Full Bleed Image Column (Desktop) */}
        <div className={styles.imageColumn}>
          {contestant.imageUrl ? (
            <Image
              src={contestant.imageUrl}
              alt={contestant.name}
              fill
              priority
              className={styles.image}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className={styles.imagePlaceholder}>👑</div>
          )}
          <div className={styles.imageOverlay}></div>
        </div>

        {/* Info & Voting Column */}
        <div className={styles.infoColumn}>
          <div className={styles.infoScrollContent}>
            
            <div className={styles.headerArea}>
              <h1 className={styles.contestantName}>{contestant.name}</h1>
              <div className={styles.eventBadge}>{contestant.event.title}</div>
            </div>

            <div className={styles.stats}>
              <div className={`${styles.statCard} glass-card`}>
                <div className={styles.statValue}>
                  {contestant.totalVotes.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Total Votes</div>
              </div>
              <div className={`${styles.statCard} glass-card`}>
                <div className={styles.statValue}>
                  {contestant.event.isActive ? 'Live' : 'Ended'}
                </div>
                <div className={styles.statLabel}>Status</div>
              </div>
            </div>

            {contestant.bio && (
              <div className={styles.bioSection}>
                <h3 className={styles.bioTitle}>About the Queen</h3>
                <p className={styles.bioText}>{contestant.bio}</p>
              </div>
            )}

            <div className={styles.divider} />

            {/* Voting Form */}
            {contestant.event.isActive ? (
              <div className={styles.votingSection}>
                <h3 className={styles.votingTitle}>Cast Your Vote</h3>
                <p className={styles.votingDesc}>
                  Support {contestant.name} by purchasing votes. Select a package below.
                </p>
                <VotingForm
                  contestantId={contestant.id}
                  contestantName={contestant.name}
                />
              </div>
            ) : (
              <div className={styles.closedSection}>
                <h3 className="heading-md text-gold">Voting Closed</h3>
                <p className="text-muted">This event has officially ended.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
