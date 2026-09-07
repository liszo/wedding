import { wedding } from "@/content/config";
import { toFa } from "@/lib/fa";
import { monthGrid, WEEKDAY_FA } from "@/lib/jalali";

/**
 * The wedding month, with the day ringed. Computed from `wedding.dateISO` via
 * lib/jalali — change the date and the grid follows, including the weekday it
 * starts on and whether Esfand has 29 days.
 */
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
                    <span
                      className={`tabular mx-auto flex h-[26px] w-[26px] items-center justify-center rounded-full text-[13px] ${
                        day === marked
                          ? "bg-umber text-white"
                          : "text-muted"
                      }`}
                    >
                      {toFa(day)}
                    </span>
                    {day === marked && (
                      <span className="sr-only">— روز مراسم</span>
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
