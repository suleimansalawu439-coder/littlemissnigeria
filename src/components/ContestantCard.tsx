import Link from 'next/link';
import Image from 'next/image';
import styles from './ContestantCard.module.css';

interface ContestantCardProps {
  slug: string;
  name: string;
  imageUrl: string | null;
  totalVotes: number;
  bio: string | null;
  rank?: number;
  /** When false the card is not a link and shows "Voting Ended" instead of "Vote Now". */
  votingOpen?: boolean;
}

export default function ContestantCard({
  name,
  slug,
  imageUrl,
  totalVotes,
  rank,
  votingOpen = true,
}: ContestantCardProps) {
  // Max votes mock for progress bar (could be dynamic based on event total)
  const maxVotes = 50000;
  const progressPercent = Math.min(100, Math.max(2, (totalVotes / maxVotes) * 100));

  const cardBody = (
      <div className={`${styles.card} glass-card`}>
        {/* Rank Badge */}
        {rank && rank <= 3 && (
          <div className={`${styles.rankBadge} ${styles[`rank${rank}`]}`}>
            <span className={styles.rankCrown}>♛</span>
            <span className={styles.rankNumber}>#{rank}</span>
          </div>
        )}

        <div className={styles.imageArea}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon}>👑</span>
            </div>
          )}
        </div>

        <div className={styles.infoArea}>
          <h3 className={styles.name}>{name}</h3>
          
          <div className={styles.voteSection}>
            <div className="flex-between">
              <span className={styles.voteLabel}>Total Votes</span>
              <span className={styles.voteCount}>{totalVotes.toLocaleString()}</span>
            </div>
            
            
            <div className={styles.progressBarBg}>
              <div 
                className={styles.progressBarFill} 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            
            <div style={{ marginTop: '12px' }}>
              {votingOpen ? (
                <span className="btn btn-primary btn-sm" style={{ width: '100%' }}>Vote Now</span>
              ) : (
                <span className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Voting Ended</span>
              )}
            </div>
          </div>
        </div>
      </div>
  );

  // Once voting closes the profile links are disabled entirely: the card is
  // no longer a link, so visitors stay on the landing page.
  if (!votingOpen) {
    return <div className={styles.cardWrapper}>{cardBody}</div>;
  }

  return (
    <Link href={`/contestants/${slug}`} className={styles.cardWrapper}>
      {cardBody}
    </Link>
  );
}
