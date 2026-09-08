import { wedding } from "@/content/config";
import { toFa } from "@/lib/fa";
import { monthGrid, WEEKDAY_FA } from "@/lib/jalali";

/**
 * The wedding month, with the day held in a heart. Computed from
 * `wedding.dateISO` via lib/jalali — change the date and the grid follows,
 * including the weekday it starts on and whether Esfand has 29 days.
 */

/**
 * The mark on the wedding day. A heart's optical centre sits above its
 * geometric one, so the numeral is nudged up to land in the lobes rather than
 * in the point.
 */
function HeartDay({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative mx-auto flex h-[32px] w-[34px] items-center justify-center">
      <svg
        viewBox="0 0 34 32"
        aria-hidden
        className="absolute inset-0 h-full w-full fill-umber"
      >
        <path d="M17 30.2C17 30.2 1.9 21.3 1.9 11.2c0-5.1 4-9 8.9-9 2.9 0 5.4 1.6 6.2 3.9.8-2.3 3.3-3.9 6.2-3.9 4.9 0 8.9 3.9 8.9 9 0 10.1-15.1 19-15.1 19Z" />
      </svg>
      <span className="tabular relative -translate-y-[7%] text-[12px] text-white">
        {children}
      </span>
    </span>
  );
}
export default function Calendar() {
  const { label, weeks, marked } = monthGrid(wedding.dateISO);

  return (
    <div className="mx-auto max-w-[280px]">
      <p className="nastaliq mb-5 text-center text-[22px] text-ink">{label}</p>

      <table className="w-full border-collapse text-center">
        <caption className="sr-only">
          تقویم {label} — روز مراسم مشخص شده است
        </caption>
        <thead>
          <tr>
            {WEEKDAY_FA.map((d) => (
              <th
                key={d}
                scope="col"
                className="pb-3 text-[9.5px] font-normal tracking-[0.14em] text-muted"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) =>
                day === null ? (
                  <td key={di} />
                ) : (
                  <td key={di} className="py-[5px]">
                    {day === marked ? (
                      <>
                        <HeartDay>{toFa(day)}</HeartDay>
                        <span className="sr-only">— روز مراسم</span>
                      </>
                    ) : (
                      <span className="tabular mx-auto flex h-[26px] w-[26px] items-center justify-center text-[13px] text-muted">
                        {toFa(day)}
                      </span>
                    )}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
