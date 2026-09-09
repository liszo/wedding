import Link from "next/link";
import { wedding } from "@/content/config";
import { toFa } from "@/lib/fa";
import { ORNAMENT } from "./ui";
import Reveal from "./Reveal";

const THINGS = [
  { icon: "📷", label: `${toFa(wedding.uploadCap)} عکس` },
  { icon: "💬", label: "پیام" },
];

/**
 * The wall's own plate, above the footer.
 *
 * It was a bordered pill reading «دیوار ما» and nothing else, which told a
 * guest neither what the wall is nor that their photographs are wanted on it.
 * This is the last thing before the closing plate, so it is the last chance to
 * ask — hence a card with its own ground rather than a link in the margin.
 */
export default function WallCta() {
  return (
    <Reveal delay={0.05}>
      <div className="wall-cta">
        <img
          src={ORNAMENT.crown}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="mx-auto w-[62px]"
        />

        <p className="label mt-4">جشن، بعد از جشن</p>
        <h3 className="nastaliq mt-1 text-[25px] text-ink">دیوار ما</h3>

        <p className="mx-auto mt-3 max-w-[248px] text-[12.5px] leading-[2] text-muted">
          عکس‌هایی که از شب مراسم می‌گیرید را برای ما بگذارید و بین خودتان
          پیام بگذارید — قاب‌های این دعوت‌نامه را شما کامل می‌کنید.
        </p>

        <ul className="wall-cta-row">
          {THINGS.map((t) => (
            <li key={t.label}>
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </li>
          ))}
        </ul>

        <Link href="/wall" className="wall-cta-go">
          رفتن به دیوار ما
        </Link>
      </div>
    </Reveal>
  );
}
