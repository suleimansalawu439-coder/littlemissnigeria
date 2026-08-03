'use client';

import { useState, useMemo } from 'react';
import styles from './page.module.css';

type Payment = {
  id: string;
  reference: string;
  voterName: string;
  email: string;
  amount: number;
  votesAdded: number;
  status: string;
  createdAt: Date;
  contestant: { name: string };
};

function formatCurrency(amount: number): string {
  return '₦' + (amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

type QuickFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month';
type SortKey = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'votes_desc' | 'votes_asc';
type StatusFilter = 'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED';

export default function PaymentsClient({ payments }: { payments: Payment[] }) {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('date_desc');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  function applyQuickFilter(filter: QuickFilter) {
    setQuickFilter(filter);
    setFromDate('');
    setToDate('');
  }

  const filtered = useMemo(() => {
    const now = new Date();

    let result = payments.filter((p) => {
      const date = new Date(p.createdAt);

      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

      // Quick date filters
      if (quickFilter === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (date < start) return false;
      } else if (quickFilter === 'yesterday') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (date < start || date >= end) return false;
      } else if (quickFilter === 'week') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        if (date < start) return false;
      } else if (quickFilter === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        if (date < start) return false;
      } else if (quickFilter === 'all' && (fromDate || toDate)) {
        // Custom date range
        if (fromDate) {
          const from = new Date(fromDate);
          if (date < from) return false;
        }
        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (date > to) return false;
        }
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'date_desc':  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date_asc':   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount_desc': return b.amount - a.amount;
        case 'amount_asc':  return a.amount - b.amount;
        case 'votes_desc':  return b.votesAdded - a.votesAdded;
        case 'votes_asc':   return a.votesAdded - b.votesAdded;
        default: return 0;
      }
    });

    return result;
  }, [payments, quickFilter, statusFilter, sortKey, fromDate, toDate]);

  const totalRevenue = filtered
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalVotes = filtered
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.votesAdded, 0);

  return (
    <>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        {/* Quick Date Chips */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Period</span>
          <div className={styles.chips}>
            {(['all', 'today', 'yesterday', 'week', 'month'] as QuickFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => applyQuickFilter(f)}
                className={`${styles.chip} ${quickFilter === f ? styles.chipActive : ''}`}
              >
                {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : f === 'yesterday' ? 'Yesterday' : f === 'week' ? 'Last 7 Days' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Custom Range</span>
          <div className={styles.dateRange}>
            <input
              type="date"
              className={styles.dateInput}
              value={fromDate}
              max={toDateInputValue(new Date())}
              onChange={(e) => { setFromDate(e.target.value); setQuickFilter('all'); }}
            />
            <span className={styles.dateSep}>→</span>
            <input
              type="date"
              className={styles.dateInput}
              value={toDate}
              max={toDateInputValue(new Date())}
              onChange={(e) => { setToDate(e.target.value); setQuickFilter('all'); }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status</span>
          <div className={styles.chips}>
            {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`${styles.chip} ${statusFilter === s ? styles.chipActive : ''} ${
                  s === 'SUCCESS' ? styles.chipSuccess : s === 'PENDING' ? styles.chipPending : s === 'FAILED' ? styles.chipFailed : ''
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Sort By</span>
          <select
            className={styles.sortSelect}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: High → Low</option>
            <option value="amount_asc">Amount: Low → High</option>
            <option value="votes_desc">Votes: High → Low</option>
            <option value="votes_asc">Votes: Low → High</option>
          </select>
        </div>
      </div>

      {/* Summary Strip */}
      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{filtered.length.toLocaleString()}</span>
          <span className={styles.summaryLbl}>Transactions</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{formatCurrency(totalRevenue)}</span>
          <span className={styles.summaryLbl}>Revenue (Success only)</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{totalVotes.toLocaleString()}</span>
          <span className={styles.summaryLbl}>Votes (Success only)</span>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableSection}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>No payments match the selected filters.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Voter Name</th>
                  <th>Email</th>
                  <th>Contestant</th>
                  <th>Amount</th>
                  <th>Votes</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <tr key={payment.id}>
                    <td><span className={styles.reference}>{payment.reference}</span></td>
                    <td>{payment.voterName}</td>
                    <td><span className={styles.email}>{payment.email}</span></td>
                    <td><span className={styles.contestantName}>{payment.contestant.name}</span></td>
                    <td><span className={styles.amount}>{formatCurrency(payment.amount)}</span></td>
                    <td><span className={styles.votes}>{payment.votesAdded}</span></td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        payment.status === 'SUCCESS' ? styles.statusSuccess
                        : payment.status === 'PENDING' ? styles.statusPending
                        : styles.statusFailed
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td><span className={styles.date}>{formatDate(payment.createdAt)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
