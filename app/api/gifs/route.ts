import { NextResponse } from "next/server";
import { getGuest } from "@/lib/guest";
import { tooMany } from "@/lib/rate-limit";

/**
 * GIF search, proxied through the server so the key never reaches a guest's
 * browser and so the app is not calling a third party from every device that
 * opens the wall.
 *
 * Optional: without TENOR_API_KEY the endpoint says so plainly and the GIF tab
 * shows that instead of failing silently. Everything else on the wall works
 * either way. A free key comes from https://developers.google.com/tenor.
 */
const ENDPOINT = "https://tenor.googleapis.com/v2/search";

export async function GET(req: Request) {
  const guest = await getGuest();
  if (!guest) return NextResponse.json({ gifs: [] }, { status: 401 });

  const key = process.env.TENOR_API_KEY;
  if (!key)
    return NextResponse.json(
      { gifs: [], message: "جست‌وجوی گیف پیکربندی نشده." },
      { status: 501 }
    );

  if (await tooMany(`gif:${guest.id}`, 40, 60))
    return NextResponse.json({ gifs: [] }, { status: 429 });

  const q = new URL(req.url).searchParams.get("q")?.slice(0, 60).trim();

  const params = new URLSearchParams({
    key,
    client_key: "wedding",
    limit: "24",
    media_filter: "tinygif,gif",
    contentfilter: "high",
    q: q || "wedding",
  });

  try {
    const res = await fetch(`${ENDPOINT}?${params}`, {
      // the same query returns the same results for a good while
      next: { revalidate: 600 },
    });
    if (!res.ok) return NextResponse.json({ gifs: [] }, { status: 502 });

    const json = (await res.json()) as {
      results?: {
        id: string;
        content_description?: string;
        media_formats?: Record<string, { url?: string; dims?: number[] }>;
      }[];
    };

    const gifs = (json.results ?? [])
      .map((r) => {
        const preview = r.media_formats?.tinygif;
        const full = r.media_formats?.gif ?? preview;
        if (!preview?.url || !full?.url) return null;
        return {
          id: r.id,
          preview: preview.url,
          url: full.url,
          w: preview.dims?.[0] ?? 200,
          h: preview.dims?.[1] ?? 200,
          alt: r.content_description ?? "GIF",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ gifs });
  } catch {
    return NextResponse.json({ gifs: [] }, { status: 502 });
  }
}
