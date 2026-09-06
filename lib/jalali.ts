/**
 * Just enough Persian calendar to draw one month grid.
 *
 * Everything derives from Intl's `persian` calendar rather than a hand-rolled
 * conversion — leap years in the Solar Hijri calendar are not something worth
 * reimplementing, and getting one wrong would put the heart on the wrong day.
 */

const PARTS = new Intl.DateTimeFormat("en-u-ca-persian", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "Asia/Tehran",
});

const MONTH_FA = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  month: "long",
  timeZone: "Asia/Tehran",
});

const YEAR_FA = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  timeZone: "Asia/Tehran",
});

type Ymd = { year: number; month: number; day: number };

function toPersian(d: Date): Ymd {
  const out: Record<string, number> = {};
  for (const p of PARTS.formatToParts(d)) {
    if (p.type === "year" || p.type === "month" || p.type === "day") {
      // the persian calendar can emit "1405 AP" for year; parseInt stops at AP
      out[p.type] = parseInt(p.value, 10);
    }
  }
  return { year: out.year, month: out.month, day: out.day };
}

const DAY = 86_400_000;

/** شنبه = 0. JS getDay() is Sunday = 0, and the Persian week starts Saturday. */
function persianWeekday(d: Date): number {
  return (d.getUTCDay() + 1) % 7;
}

export type MonthGrid = {
  /** e.g. "مهر ۱۴۰۵" */
  label: string;
  /** rows of 7, null for the leading/trailing blanks */
  weeks: (number | null)[][];
  /** the day of the month the wedding falls on */
  marked: number;
};

export const WEEKDAY_FA = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/**
 * The Persian month containing `iso`, as a grid ready to render, with the day
 * of `iso` flagged so the view can put a heart behind it.
 */
export function monthGrid(iso: string): MonthGrid {
  // Work at noon UTC so a timezone shift can never move us onto another day.
  const target = new Date(iso);
  const noon = new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      target.getUTCDate(),
      12
    )
  );

  const { month, day: marked } = toPersian(noon);

  // Gregorian date of the 1st of this Persian month
  const first = new Date(noon.getTime() - (marked - 1) * DAY);

  // Walk forward until the Persian month rolls over — no leap-year table needed
  let length = 0;
  for (let i = 0; i < 32; i++) {
    if (toPersian(new Date(first.getTime() + i * DAY)).month !== month) break;
    length = i + 1;
  }

  const lead = persianWeekday(first);
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return {
    label: `${MONTH_FA.format(noon)} ${YEAR_FA.format(noon)}`,
    weeks,
    marked,
  };
}
