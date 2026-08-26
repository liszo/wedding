import { wedding } from "@/content/config";
import { googleCalendarUrl, neshanUrl, googleMapsUrl } from "@/lib/calendar";

export default function Ceremony() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-md rounded-3xl bg-raised/70 p-7 ring-1 ring-candle/10">
        <h2 className="mb-6 text-center text-lg text-candle">مراسم</h2>

        <dl className="space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-mist/45">تاریخ</dt>
            <dd>
              {wedding.weekdayFa} {wedding.dateFa}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist/45">ساعت</dt>
            <dd>{wedding.timeFa}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist/45">مکان</dt>
            <dd className="text-end">{wedding.venue.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist/45">نشانی</dt>
            <dd className="text-end leading-relaxed">{wedding.venue.address}</dd>
          </div>
        </dl>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <a
            href={neshanUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-candle/12 py-3 text-center text-sm text-candle ring-1 ring-candle/20 transition hover:bg-candle/20"
          >
            نشان
          </a>
          <a
            href={googleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-candle/12 py-3 text-center text-sm text-candle ring-1 ring-candle/20 transition hover:bg-candle/20"
          >
            گوگل مپ
          </a>
        </div>

        <a
          href={googleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block rounded-xl bg-candle py-3.5 text-center text-sm font-medium text-night transition hover:bg-saffron"
        >
          افزودن به تقویم
        </a>
      </div>
    </section>
  );
}