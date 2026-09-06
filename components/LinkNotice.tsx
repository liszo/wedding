import LostLinkModal from "./LostLinkModal";

/**
 * /i/[token] redirects here with ?e=bad or ?e=slow when a link fails. Before
 * this existed the guest was dropped on the homepage with no explanation and
 * no name — they had no way to tell a broken link from a working one.
 */
const MESSAGES: Record<string, string> = {
  bad: "این لینک شناخته نشد. شاید ناقص کپی شده باشد.",
  slow: "تلاش‌های زیادی از این دستگاه انجام شده. چند دقیقه صبر کن و دوباره امتحان کن.",
};

export default function LinkNotice({ code }: { code?: string }) {
  const message = code ? MESSAGES[code] : undefined;
  if (!message) return null;

  return (
    <div role="alert" className="px-6 pt-6">
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-crimson/30 bg-crimson/5 px-5 py-4 text-center">
        <p className="text-sm leading-7 text-ink">{message}</p>
        {code === "bad" && <LostLinkModal />}
      </div>
    </div>
  );
}
