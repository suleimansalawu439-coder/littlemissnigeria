// Central voting-window rule for the platform.
//
// Voting is open only while BOTH of these hold:
//   1. the event is manually active (the admin kill-switch), AND
//   2. the countdown deadline (event.endDate) has not passed.
//
// Every place that gates voting — the voting form, the payment APIs, the
// Paystack webhook, the reconciliation cron, and the contestant pages — must
// use this helper so the cutoff is automatic and consistent. The countdown
// timer on its own never disables anything; this is what enforces it.
export function isVotingOpen(event: { isActive: boolean; endDate: Date | string }): boolean {
  if (!event.isActive) return false;
  const endTime =
    event.endDate instanceof Date ? event.endDate.getTime() : new Date(event.endDate).getTime();
  return endTime > Date.now();
}
