import Link from 'next/link';
import styles from './ContestantCard.module.css';

interface ContestantCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  totalVotes: number;
  bio: string | null;
}

export default function ContestantCard({
  id,
  name,
  imageUrl,
  totalVotes,
  bio,
}: ContestantCardProps) {
  return (
    <Link href={`/contestants/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder}>👑</div>
        )}
        <div className={styles.imageOverlay} />
        <div className={styles.voteBadge}>
          <span className={styles.voteBadgeIcon}>🗳️</span>
          {totalVotes.toLocaleString()} votes
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        {bio && <p className={styles.bio}>{bio}</p>}
        <div className={styles.footer}>
          <span className={styles.votes}>
            <span className={styles.votesCount}>
              {totalVotes.toLocaleString()}
            </span>{' '}
            total votes
          </span>
          <span className={styles.voteBtn}>Vote Now</span>
        </div>
      </div>
    </Link>
  );
}
