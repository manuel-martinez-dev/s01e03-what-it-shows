<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/problems';

  let {
    ticket,
    issues,
    status = {},
    repo,
  }: { ticket: number; issues: Partial<Record<Problem, number>>; status?: Partial<Record<Problem, string>>; repo: string } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const LABEL: Record<Problem, string> = {
    parser: 'shared parser reads day-first dates month first',
    hint: 'booking-v3 form hint says MM/DD/YYYY to day-first tenants',
    'one-day': 'date moves by one day, no flip',
    unplaced: 'no tenant on file',
  };
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>status</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr class:open={status[g.problem] === 'open'}>
        <td><code>{g.problem}</code> {LABEL[g.problem]}</td>
        <td>{g.reports.length}{g.alsoIn ? '*' : ''}</td>
        <td>{g.tenants.length}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if issues[g.problem]}<a href="https://github.com/{repo}/issues/{issues[g.problem]}">{repo}#{issues[g.problem]}</a>{:else}none yet{/if}
        </td>
        <td>{status[g.problem] ?? 'open'}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.groups as g (g.problem)}
  {#if g.alsoIn}
    <p class="ids">* {g.reports.length} reports the desk read as a one-day move, also counted under <code>{g.alsoIn}</code> where they are filed: {g.reports.map((r) => r.id).join(', ')} ({g.tenants.join(', ')}).</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .ids { color: var(--muted); font-size: 0.85em; }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
