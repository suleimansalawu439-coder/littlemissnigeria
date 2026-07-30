import CountdownTimer from '@/components/CountdownTimer';
import styles from './maintenance.module.css';

// Ensure the page is completely static and doesn't hit the database
export const dynamic = 'force-static';

export default function MaintenancePage() {
  // Target: 3rd August 2026, 9:00 AM Lagos time (WAT = UTC+1)
  const targetDate = "2026-08-03T09:00:00+01:00";

  return (
    <div className={styles.maintenanceContainer}>
      <div className={styles.particlesContainer}>
        <div className={styles.particle} style={{top: '10%', left: '15%', animationDelay: '0s'}}></div>
        <div className={styles.particle} style={{top: '60%', right: '10%', animationDelay: '2s'}}></div>
        <div className={styles.particle} style={{bottom: '-10%', left: '50%', animationDelay: '4s'}}></div>
      </div>

      <main className={styles.contentWrapper}>
        <div className={styles.iconWrapper}>
          👑
        </div>
        
        <h1 className={styles.title}>Under Maintenance</h1>
        
        <p className={styles.subtitle}>
          We are currently upgrading our platform to provide you with a flawless voting experience. 
          The stage is being set, and the queens will return shortly.
        </p>

        <div className={styles.countdownBox}>
          <span className={styles.countdownLabel}>Voting Commences In</span>
          <CountdownTimer endDate={targetDate} />
        </div>
      </main>
    </div>
  );
}
