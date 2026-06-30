'use client';

import { useState, FormEvent } from 'react';
import styles from './VotingForm.module.css';

interface VotingFormProps {
  contestantId: string;
  contestantName: string;
}

const PACKAGES = [
  { votes: 1, amount: 100, label: '1 Vote', price: '₦100' },
  { votes: 5, amount: 500, label: '5 Votes', price: '₦500' },
];

export default function VotingForm({
  contestantId,
  contestantName,
}: VotingFormProps) {
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentPackage = PACKAGES[selectedPackage];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId,
          votes: currentPackage.votes,
          amount: currentPackage.amount,
          voterName: name.trim(),
          email: email.trim(),
          phoneNumber: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      // Redirect to Paystack payment URL
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('No payment URL received.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Cast Your Vote</h3>
      <p className={styles.subtitle}>
        Vote for <strong>{contestantName}</strong> — select a package below
      </p>

      {/* Package Selection */}
      <div className={styles.packages}>
        {PACKAGES.map((pkg, index) => (
          <label
            key={pkg.votes}
            className={
              selectedPackage === index
                ? styles.packageCardSelected
                : styles.packageCard
            }
          >
            <input
              type="radio"
              name="package"
              value={index}
              checked={selectedPackage === index}
              onChange={() => setSelectedPackage(index)}
              className={styles.hiddenRadio}
            />
            <div className={styles.packageVotes}>{pkg.votes}</div>
            <div className={styles.packageVotesLabel}>
              {pkg.votes === 1 ? 'Vote' : 'Votes'}
            </div>
            <div className={styles.packagePrice}>
              {pkg.price}
            </div>
          </label>
        ))}
      </div>

      {/* Order Summary */}
      <div className={styles.summary}>
        <span className={styles.summaryLabel}>Total</span>
        <span className={styles.summaryValue}>{currentPackage.price}</span>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="voterName">
            Full Name
          </label>
          <input
            id="voterName"
            type="text"
            className={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="voterEmail">
            Email Address
          </label>
          <input
            id="voterEmail"
            type="email"
            className={styles.input}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="voterPhone">
            Phone Number
          </label>
          <input
            id="voterPhone"
            type="tel"
            className={styles.input}
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.loading}>
              <span className={styles.loadingSpinner} />
              Processing...
            </span>
          ) : (
            <>💳 Pay & Vote — {currentPackage.price}</>
          )}
        </button>
      </form>
    </div>
  );
}
