/**
 * What a message's media URL actually is.
 *
 * Everything a message carries — a photograph, a sticker, a GIF, a voice note —
 * travels in the one `image_url` column, because every one of them is a URL to
 * a file and the alternative is a migration on a table already holding real
 * guests' posts. These are the rules that tell them apart, and they are the
 * only place that knowledge lives.
 */

const AUDIO = /\.(webm|m4a|mp3|ogg|wav)(\?.*)?$/i;

export function isAudioUrl(url: string | null): boolean {
  return Boolean(url) && AUDIO.test(url!);
}

/** Hosts a GIF may be embedded from. Anything else is refused at the API. */
const GIF_HOSTS = new Set([
  "media.tenor.com",
  "c.tenor.com",
  "media1.tenor.com",
  "media2.tenor.com",
  "tenor.com",
]);

export function isAllowedGifUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && GIF_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/**
 * The storage key inside the `wall` bucket for a URL this app uploaded, or
 * null for anything it did not (stickers, GIFs). Deleting a message uses it so
 * the file does not outlive the message it belonged to.
 */
export function storageKey(url: string | null, bucket = "wall"): string | null {
  if (!url) return null;
  const marker = `/object/public/${bucket}/`;
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const key = url.slice(at + marker.length).split("?")[0];
  return key ? decodeURIComponent(key) : null;
}
