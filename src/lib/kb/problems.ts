// The problems inside a merged ticket, counted the desk's way: every report under its cause
// (causes.ts), and the desk's one-day moves (desk-notes.json) as a problem of their own that
// stays counted where it is filed.
import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
  // For a group that is also counted under a cause: that cause.
  alsoIn?: Problem;
};

function group(problem: Problem, reports: Report[], alsoIn?: Problem): ProblemGroup {
  const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
  return { problem, reports, tenants: [...new Set(reports.map((r) => r.tenant))].sort(), firstSeen: days[0], lastSeen: days[days.length - 1], alsoIn };
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const causes = groupByCause(merged, tenantOf);
  const groups = causes.map((g) => group(g.cause, g.reports));
  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length) {
    const home = causes.find((g) => g.reports.some((r) => oneDay.includes(r.id)))?.cause;
    groups.push(group('one-day', moved, home));
  }
  return { merged, groups };
}
