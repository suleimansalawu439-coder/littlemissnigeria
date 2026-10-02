// Central voting-window rules for the platform.
//
// The countdown timer on its own never disables anything; these helpers are
// what enforce the cutoff, and every gating point must use them.

// Voting is open only while BOTH of these hold:
//   1. the event is manually active (the admin kill-switch), AND
//   2. the countdown deadline (event.endDate) has not passed.
//
// Used by: the voting form, the payment initialize API, the contestant
// pages, and the landing page.
export function isVotingOpen(event: { isActive: boolean; endDate: Date | string }): boolean {
  if (!event.isActive) return false;
  const endTime =
    event.endDate instanceof Date ? event.endDate.getTime() : new Date(event.endDate).getTime();
  return endTime > Date.now();
}

// A payment counts if the voter STARTED it while voting was open, even if
// Paystack confirms it moments after the deadline. The voter's action
// happened in time — we never take money without counting the vote.
// (Post-deadline starts are impossible: initialize rejects them, so this
// only covers the race window of in-flight checkouts.)
//
// Used by: the payment verify API, the Paystack webhook, and the
// reconciliation cron.
export function wasVotingOpenAt(
  at: Date | string,
  event: { endDate: Date | string }
): boolean {
  const t = at instanceof Date ? at.getTime() : new Date(at).getTime();
  const endTime =
    event.endDate instanceof Date ? event.endDate.getTime() : new Date(event.endDate).getTime();
  return t < endTime;
}
