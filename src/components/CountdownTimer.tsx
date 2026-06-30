'use client';

import { useState, useEffect } from 'react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  endDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
  const difference = new Date(endDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    calculateTimeLeft(endDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) {
    return (
      <div className={styles.expired}>
        <span className={styles.expiredText}>Voting has ended</span>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className={styles.wrapper}>
      {units.map((unit, index) => (
        <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div className={styles.timeUnit}>
            <div className={styles.timeBox}>
              <span className={styles.timeValue}>
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className={styles.timeLabel}>{unit.label}</span>
          </div>
          {index < units.length - 1 && (
            <span className={styles.separator}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}
