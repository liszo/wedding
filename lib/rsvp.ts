import { wedding } from "@/content/config";

/**
 * The one place that decides whether the form is shut. Both the page (which
 * hides the form) and /api/rsvp (which refuses the write) call this, so there
 * is no way for the two to disagree about it.
 *
 * A null deadline means it never shuts.
 */
export function rsvpClosed(): boolean {
  const at = wedding.rsvpDeadlineISO;
  if (!at) return false;
  return Date.now() > new Date(at).getTime();
}
