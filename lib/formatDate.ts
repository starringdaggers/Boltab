/** Formats an ISO date string ("2026-09-14") as "14th September, 2026".
 * Falls back to returning the raw value unchanged if it isn't a recognizable
 * ISO date (e.g. an older free-typed string like "14th September, 2026"
 * entered before the calendar picker existed).
 */
export function formatOrdinalDate(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value; // already a display string, or unrecognized — pass through

  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return value;

  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${day}${suffix} ${month}, ${date.getFullYear()}`;
}
