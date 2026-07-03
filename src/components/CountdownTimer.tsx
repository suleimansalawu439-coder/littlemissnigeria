'use client';

import { useState, useEffect } from 'react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  endDate: string; // ISO String
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setIsUrgent(difference < 86400000); // Less than 24 hours
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!isMounted) {
    return (
      <div className={styles.timerWrapper}>
        <div className={styles.skeleton}></div>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className={styles.timeUnit}>
      <div className={`${styles.flipCard} ${isUrgent ? styles.urgentCard : ''}`}>
        <span className={styles.digit}>{formatNumber(value)}</span>
      </div>
      <span className={`${styles.label} ${isUrgent ? styles.urgentLabel : ''}`}>{label}</span>
    </div>
  );

  return (
    <div className={styles.timerWrapper}>
      <TimeUnit value={timeLeft.days} label="Days" />
      <span className={styles.separator}>:</span>
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <span className={styles.separator}>:</span>
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <span className={styles.separator}>:</span>
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
