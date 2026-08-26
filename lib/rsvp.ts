import { wedding } from "@/content/config";

export function rsvpClosed(): boolean {
  return Date.now() > new Date(wedding.rsvpDeadlineISO).getTime();
}