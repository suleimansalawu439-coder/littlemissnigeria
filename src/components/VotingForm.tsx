'use client';

import { useState } from 'react';
import styles from './VotingForm.module.css';

interface VotingFormProps {
  contestantId: string;
  contestantName: string;
}

const VOTE_PACKAGES = [
  { id: 'pack-1', votes: 1, amount: 100, label: 'Single' },
  { id: 'pack-2', votes: 5, amount: 500, label: 'Bronze' },
  { id: 'pack-3', votes: 10, amount: 1000, label: 'Silver', popular: true },
  { id: 'pack-4', votes: 50, amount: 5000, label: 'Gold' },
  { id: 'pack-5', votes: 100, amount: 10000, label: 'Platinum' },
  { id: 'pack-6', votes: 200, amount: 20000, label: 'Diamond' },
];

export default function VotingForm({ contestantId }: VotingFormProps) {
  const [selectedPackage, setSelectedPackage] = useState(VOTE_PACKAGES[1]);
  const [voterName, setVoterName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName,
          email,
          phoneNumber,
          contestantId,
          votes: selectedPackage.votes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to initialize payment');
        throw new Error(errorMsg);
      }

      // Redirect to Paystack checkout
      window.location.href = data.authorizationUrl;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleVote}>
      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.packageSelection}>
        <label className={styles.label}>Select Package</label>
        <div className={styles.packageGrid}>
          {VOTE_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`${styles.packageCard} ${
                selectedPackage.id === pkg.id ? styles.packageCardSelected : ''
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.popular && <span className={styles.popularBadge}>Most Popular</span>}
              <div className={styles.pkgTitle}>{pkg.label}</div>
              <div className={styles.pkgVotes}>
                <span className={styles.pkgVoteNumber}>{pkg.votes}</span>
                <span className={styles.pkgVoteText}>Votes</span>
              </div>
              <div className={styles.pkgPrice}>₦{pkg.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="voter-name" className={styles.label}>Full Name</label>
        <input
          id="voter-name"
          type="text"
          className="form-input"
          placeholder="Enter your name"
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="voter-email" className={styles.label}>Email Address</label>
        <input
          id="voter-email"
          type="email"
          className="form-input"
          placeholder="For payment receipt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="voter-phone" className={styles.label}>Phone Number</label>
        <input
          id="voter-phone"
          type="tel"
          className="form-input"
          placeholder="e.g. 08012345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className={`btn btn-primary ${styles.submitBtn}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            Processing...
          </>
        ) : (
          `Pay ₦${selectedPackage.amount.toLocaleString()} to Vote`
        )}
      </button>
      
      <p className={styles.secureText}>
        🔒 Secure payment powered by Paystack
      </p>
    </form>
  );
}
