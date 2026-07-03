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
}

export default function ContestantCard({
  name,
  slug,
  imageUrl,
  totalVotes,
  rank,
}: ContestantCardProps) {
  // Max votes mock for progress bar (could be dynamic based on event total)
  const maxVotes = 50000;
  const progressPercent = Math.min(100, Math.max(2, (totalVotes / maxVotes) * 100));

  return (
    <Link href={`/contestants/${slug}`} className={styles.cardWrapper}>
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
          
          {/* Hover Overlay */}
          <div className={styles.hoverOverlay}>
            <span className="btn btn-primary btn-sm">Vote Now</span>
          </div>
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
          </div>
        </div>
      </div>
    </Link>
  );
}
