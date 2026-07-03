/**
 * Formatting helpers for Paraguayan Guaraní (Gs) and dates.
 *
 * These avoid `Intl` on purpose: the Cloudflare Workers runtime (where this app
 * is deployed via OpenNext) ships with limited ICU locale data, so `Intl`
 * grouping/locale output can't be relied on. We format manually instead.
 */

/** Format an integer amount with "." as the thousands separator (Paraguay style). */
export function formatNumber(value) {
  const rounded = Math.round(Number(value) || 0);
  const negative = rounded < 0;
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return negative ? `-${digits}` : digits;
}

/** Format an amount as Guaraníes, e.g. `Gs 4.000.000`. */
export function formatGuarani(value) {
  return `Gs ${formatNumber(value)}`;
}

/**
 * Format a date as `dd/mm/yyyy`. Returns "" for missing/invalid dates.
 *
 * Uses UTC parts so a stored UTC instant renders the same calendar date in dev
 * and on the (UTC) Workers runtime, avoiding an off-by-one near midnight.
 */
export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
