<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem in a merged ticket. causes.ts places a report by its tenant; the reports the
  // desk read as a one-day move (desk-notes.json) describe a different symptom, so they get their own row.
  let { ticket, filed = {} }: { ticket: number; filed?: Record<string, string> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const oneDay = $derived(merged.filter((r) => notes.oneDayMove.includes(r.id)));
  const rows = $derived([
    ...groupByCause(merged.filter((r) => !notes.oneDayMove.includes(r.id)), tenantOf).map((g) => ({
      problem: g.cause as string,
      reports: g.reports,
    })),
    ...(oneDay.length ? [{ problem: 'one-day-move', reports: oneDay }] : []),
  ]);
  const span = (rs: Report[]) => {
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return `${days[0]} → ${days[days.length - 1]}`;
  };
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong>
  {rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as row (row.problem)}
      <tr>
        <td><code>{row.problem}</code></td>
        <td>{row.reports.length}</td>
        <td>{new Set(row.reports.map((r) => r.tenant)).size}</td>
        <td>{span(row.reports)}</td>
        <td>{#if filed[row.problem]}<a href={filed[row.problem]}>{filed[row.problem].replace(/^.*\/issues\//, '#')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td>{rows.reduce((n, row) => n + row.reports.length, 0)}</td><td colspan="3"></td></tr>
  </tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  tfoot td { font-weight: 600; }
</style>
