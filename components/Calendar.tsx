import { wedding } from "@/content/config";
import { toFa } from "@/lib/fa";
import { monthGrid, WEEKDAY_FA } from "@/lib/jalali";

/**
 * The wedding month, with a heart behind the day. Computed from
 * `wedding.dateISO` via lib/jalali — change the date and the grid follows,
 * including the weekday it starts on and whether Esfand has 29 days.
 */
export default function Calendar() {
  const { label, weeks, marked } = monthGrid(wedding.dateISO);

  return (
    <div className="mx-auto max-w-[300px]">
      <p className="nastaliq mb-6 text-center text-[26px] text-[#F6F3E7]">
        {label}
      </p>

      <table className="w-full border-collapse text-center">
        <caption className="sr-only">
          تقویم {label} — روز مراسم با قلب مشخص شده است
        </caption>
        <thead>
          <tr>
            {WEEKDAY_FA.map((d) => (
              <th
                key={d}
                scope="col"
                className="pb-3 text-[10.5px] font-normal tracking-[0.1em] text-gold-lite"
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
                ) : day === marked ? (
                  <td key={di} className="relative py-1.5 text-sm">
                    {/* the heart is a clip-path, so it stays crisp at any dpr
                        and needs no extra request */}
                    <span
                      aria-hidden
                      className="absolute start-1/2 top-1/2 h-[29px] w-[30px] -translate-x-1/2 translate-y-[-54%] bg-[#F0EAD7] rtl:translate-x-1/2"
                      style={{
                        clipPath:
                          'path("M15 28C4 20 0 13 0 8.5 0 3.5 3.6 0 8 0c3 0 5.6 1.7 7 4.3C16.4 1.7 19 0 22 0c4.4 0 8 3.5 8 8.5 0 4.5-4 11.5-15 19.5z")',
                      }}
                    />
                    <span className="relative z-2 font-medium text-olive-deep">
                      {toFa(day)}
                    </span>
                    <span className="sr-only">— روز مراسم</span>
                  </td>
                ) : (
                  <td key={di} className="py-1.5 text-sm text-on-olive">
                    {toFa(day)}
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
