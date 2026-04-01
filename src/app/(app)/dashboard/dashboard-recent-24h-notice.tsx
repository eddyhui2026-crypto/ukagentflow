/** Info strip: explains that “New” uses a rolling 24-hour window. Server-rendered (no client state). */
export function DashboardRecent24hNotice({
  feedbackSale,
  feedbackLetting,
  prequalSale,
  prequalLetting,
}: {
  feedbackSale: number;
  feedbackLetting: number;
  prequalSale: number;
  prequalLetting: number;
}) {
  const totalFeedback = feedbackSale + feedbackLetting;
  const totalPrequal = prequalSale + prequalLetting;
  if (totalFeedback + totalPrequal <= 0) return null;

  return (
    <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
      <strong className="font-semibold">Last 24 hours</strong> (rolling from now):{" "}
      {totalFeedback > 0 ? (
        <>
          <strong className="font-semibold tabular-nums">{totalFeedback}</strong> feedback (
          <span className="tabular-nums">{feedbackSale}</span> for sale,&nbsp;
          <span className="tabular-nums">{feedbackLetting}</span> to let)
        </>
      ) : null}
      {totalFeedback > 0 && totalPrequal > 0 ? " and " : null}
      {totalPrequal > 0 ? (
        <>
          <strong className="font-semibold tabular-nums">{totalPrequal}</strong> pre-viewing (
          <span className="tabular-nums">{prequalSale}</span> for sale,&nbsp;
          <span className="tabular-nums">{prequalLetting}</span> to let)
        </>
      ) : null}
      . <span className="font-semibold">New</span> badges in the tables match this window (live instructions
      only).
    </p>
  );
}
