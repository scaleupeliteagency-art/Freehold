/**
 * Centralized Period Calculation & Review Scheduling Engine
 * Enforces calendar integrity, timezone respect, and system lifecycle bounds.
 */

export function calculateReviewPeriods(system, existingReviews = []) {
  if (!system || !system.start_date) return [];

  const now = new Date();
  const startDate = new Date(system.start_date);
  startDate.setHours(0, 0, 0, 0);

  const expirationDate = system.expiration_date || system.deadline ? new Date(system.expiration_date || system.deadline) : null;
  if (expirationDate) {
    expirationDate.setHours(23, 59, 59, 999);
  }

  // Do not generate due reviews if system has not started yet
  if (startDate > now) return [];

  // Effective cutoff is the earlier of 'now' or 'expirationDate'
  const effectiveEnd = expirationDate && expirationDate < now ? expirationDate : now;

  const due = [];

  // 1. WEEKLY REVIEWS: Sunday or configured review day, each 7 full calendar days
  const msInDay = 24 * 60 * 60 * 1000;
  const daysDiff = Math.floor((effectiveEnd.getTime() - startDate.getTime()) / msInDay);
  const weeksElapsed = Math.floor(daysDiff / 7);

  for (let i = 0; i < weeksElapsed; i++) {
    const pStart = new Date(startDate.getTime() + (i * 7 * msInDay));
    const pEnd = new Date(startDate.getTime() + ((i + 1) * 7 * msInDay) - 1);

    const periodStart = pStart.toISOString().split("T")[0];
    const periodEnd = pEnd.toISOString().split("T")[0];

    // Only add if no completed/draft review already exists for this exact system and period
    const alreadyExists = existingReviews.some(
      (r) => r.type === "WEEKLY" && r.period_start === periodStart
    );

    if (!alreadyExists) {
      due.push({
        id: `due_weekly_${system.id}_${periodStart}`,
        system_id: system.id,
        type: "WEEKLY",
        period_start: periodStart,
        period_end: periodEnd,
        status: "DUE",
        title: `Week ${i + 1} Review (${periodStart} → ${periodEnd})`,
      });
    }
  }

  // 2. MONTHLY REVIEWS: Calendar months that have fully concluded
  const monthsElapsed = (effectiveEnd.getFullYear() - startDate.getFullYear()) * 12 + effectiveEnd.getMonth() - startDate.getMonth();
  for (let i = 0; i < monthsElapsed; i++) {
    const pStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const pEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);

    const periodStart = pStart.toISOString().split("T")[0];
    const periodEnd = pEnd.toISOString().split("T")[0];

    const alreadyExists = existingReviews.some(
      (r) => r.type === "MONTHLY" && r.period_start === periodStart
    );

    if (!alreadyExists) {
      due.push({
        id: `due_monthly_${system.id}_${periodStart}`,
        system_id: system.id,
        type: "MONTHLY",
        period_start: periodStart,
        period_end: periodEnd,
        status: "DUE",
        title: `Month ${i + 1} Review (${periodStart} → ${periodEnd})`,
      });
    }
  }

  // 3. QUARTERLY REVIEWS: Complete 3-month blocks
  const quartersElapsed = Math.floor(monthsElapsed / 3);
  for (let i = 0; i < quartersElapsed; i++) {
    const pStart = new Date(startDate.getFullYear(), startDate.getMonth() + (i * 3), 1);
    const pEnd = new Date(startDate.getFullYear(), startDate.getMonth() + (i * 3) + 3, 0);

    const periodStart = pStart.toISOString().split("T")[0];
    const periodEnd = pEnd.toISOString().split("T")[0];

    const alreadyExists = existingReviews.some(
      (r) => r.type === "QUARTERLY" && r.period_start === periodStart
    );

    if (!alreadyExists) {
      due.push({
        id: `due_quarterly_${system.id}_${periodStart}`,
        system_id: system.id,
        type: "QUARTERLY",
        period_start: periodStart,
        period_end: periodEnd,
        status: "DUE",
        title: `Quarter ${i + 1} Review (${periodStart} → ${periodEnd})`,
      });
    }
  }

  // 4. YEARLY REVIEWS: Full 365-day cycles
  const yearsElapsed = effectiveEnd.getFullYear() - startDate.getFullYear();
  for (let i = 0; i < yearsElapsed; i++) {
    const pStart = new Date(startDate.getFullYear() + i, startDate.getMonth(), startDate.getDate());
    const pEnd = new Date(startDate.getFullYear() + i + 1, startDate.getMonth(), startDate.getDate() - 1);

    const periodStart = pStart.toISOString().split("T")[0];
    const periodEnd = pEnd.toISOString().split("T")[0];

    const alreadyExists = existingReviews.some(
      (r) => r.type === "YEARLY" && r.period_start === periodStart
    );

    if (!alreadyExists) {
      due.push({
        id: `due_yearly_${system.id}_${periodStart}`,
        system_id: system.id,
        type: "YEARLY",
        period_start: periodStart,
        period_end: periodEnd,
        status: "DUE",
        title: `Year ${i + 1} Review (${periodStart} → ${periodEnd})`,
      });
    }
  }

  return due.reverse();
}

/**
 * Calculates correct manual period start and end relative to system schedule
 */
export function getStandardPeriodBounds(reviewType, system) {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const nowStr = now.toISOString().split("T")[0];

  const startDate = system?.start_date ? new Date(system.start_date) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (reviewType === "WEEKLY") {
    const pStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      periodStart: pStart < startDate ? startDate.toISOString().split("T")[0] : pStart.toISOString().split("T")[0],
      periodEnd: nowStr,
    };
  }

  if (reviewType === "MONTHLY") {
    const pStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      periodStart: pStart.toISOString().split("T")[0],
      periodEnd: nowStr,
    };
  }

  if (reviewType === "QUARTERLY") {
    const currentQ = Math.floor(now.getMonth() / 3);
    const pStart = new Date(now.getFullYear(), currentQ * 3, 1);
    return {
      periodStart: pStart.toISOString().split("T")[0],
      periodEnd: nowStr,
    };
  }

  if (reviewType === "YEARLY") {
    const pStart = new Date(now.getFullYear(), 0, 1);
    return {
      periodStart: pStart.toISOString().split("T")[0],
      periodEnd: nowStr,
    };
  }

  return {
    periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    periodEnd: nowStr,
  };
}
