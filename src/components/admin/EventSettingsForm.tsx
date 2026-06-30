'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Calendar, Trophy } from 'lucide-react';
import styles from './EventSettingsForm.module.css';

interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  contestantCount: number;
}

interface EventSettingsFormProps {
  initialEvent: EventData | null;
}

export default function EventSettingsForm({ initialEvent }: EventSettingsFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [startDate, setStartDate] = useState(initialEvent?.startDate || '');
  const [endDate, setEndDate] = useState(initialEvent?.endDate || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Both start and end dates are required.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');

      setSuccess('Event settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (!initialEvent) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <Settings size={48} />
          <h2>No Active Event</h2>
          <p>There is no active event to configure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Event Settings</h1>
        <p className={styles.pageSubtitle}>
          Configure the current voting event details.
        </p>
      </div>

      {/* Quick stats */}
      <div className={styles.quickStats}>
        <div className={styles.quickStat}>
          <Trophy size={20} className={styles.quickStatIcon} />
          <div>
            <div className={styles.quickStatValue}>{initialEvent.contestantCount}</div>
            <div className={styles.quickStatLabel}>Contestants</div>
          </div>
        </div>
        <div className={styles.quickStat}>
          <Calendar size={20} className={styles.quickStatIcon} />
          <div>
            <div className={styles.quickStatValue}>
              {initialEvent.isActive ? 'Active' : 'Inactive'}
            </div>
            <div className={styles.quickStatLabel}>Event Status</div>
          </div>
        </div>
      </div>

      {success && <div className={styles.successMsg}>{success}</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Event Title *</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Little Miss Nigeria 2026"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event..."
              rows={4}
            />
          </div>

          <div className={styles.dateRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Start Date *</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>End Date *</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
