import { wedding, coupleNames } from "@/content/config";

/** RFC 5545 UTC stamp: 20260923T153000Z */
function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Commas, semicolons, backslashes and newlines are all special in ICS text. */
function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * A downloadable calendar entry. The Google Calendar link only helps guests who
 * use Google; an .ics opens in iOS Calendar, Outlook and every Iranian calendar
 * app that reads the standard.
 */
export function GET() {
  const start = new Date(wedding.dateISO);
  const end = new Date(start.getTime() + wedding.durationHours * 3_600_000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//wedding-invitation//FA//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    // stable across regenerations so re-downloading updates rather than duplicates
    `UID:wedding-${stamp(start)}@invitation.local`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`عروسی ${coupleNames}`)}`,
    `LOCATION:${esc(`${wedding.venue.name} — ${wedding.venue.address}`)}`,
    `DESCRIPTION:${esc("منتظر دیدنت هستیم.")}`,
    `GEO:${wedding.venue.lat};${wedding.venue.lng}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`فردا عروسی ${coupleNames}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="invite.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
