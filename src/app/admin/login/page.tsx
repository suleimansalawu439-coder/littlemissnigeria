'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError('Invalid username or password');
      setIsLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Background Particles (CSS only) */}
      <div className={styles.particlesContainer}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`
          }} />
        ))}
      </div>

      <div className={styles.loginWrapper}>
        <div className={styles.brandHeader}>
          <div className={styles.brandIcon}>♛</div>
          <h1 className={styles.brandTitle}>Little Miss Nigeria</h1>
          <p className={styles.brandSubtitle}>Admin Portal Area</p>
        </div>

        <div className={`${styles.loginCard} glass-card shimmer-border`}>
          <h2 className={styles.cardTitle}>Sign In</h2>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.backLink}>
            <Link href="/">← Return to Public Site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
