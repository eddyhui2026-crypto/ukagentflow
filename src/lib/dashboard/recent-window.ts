/** Rolling window for “New” on dashboard activity (feedback + pre-viewing). */
export const DASHBOARD_ROLLING_RECENT_HOURS = 24;

export function dashboardRollingRecentSince(now: Date = new Date()): Date {
  return new Date(now.getTime() - DASHBOARD_ROLLING_RECENT_HOURS * 60 * 60 * 1000);
}
