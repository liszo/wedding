import { wedding } from "@/content/config";

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(): string {
  const start = new Date(wedding.dateISO);
  const end = new Date(start.getTime() + wedding.durationHours * 3600_000);

  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `عروسی ${wedding.brideName} و ${wedding.groomName}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: "منتظر دیدنت هستیم.",
    location: `${wedding.venue.name} — ${wedding.venue.address}`,
  });

  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/**
 * Prefer the saved-place link. `/maps/@lat,lng,zoom` only points the camera at
 * a spot — it renders no marker, so a guest arrives at an unlabelled patch of
 * map. `places/<id>` (and its nshn.ir short form) is what drops the pin.
 */
export function neshanUrl(): string {
  if (wedding.venue.neshan) return wedding.venue.neshan;
  const { lat, lng } = wedding.venue;
  return `https://neshan.org/maps/@${lat},${lng},16.0z`;
}

export function googleMapsUrl(): string {
  const { lat, lng } = wedding.venue;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}