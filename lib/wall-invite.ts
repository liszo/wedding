/**
 * Whether the "there is a wall, and you can put your photographs on it"
 * invitation is showing.
 *
 * A module-level store rather than context, for the same reason lib/music.ts
 * is one: the thing that opens it (the empty frame in the gallery, a long way
 * up the page) and the thing that renders it live in different subtrees, and
 * threading a prop between them would mean making every band in between a
 * client component.
 */

const listeners = new Set<() => void>();
let open = false;

/** Shown once per browser, unprompted. After that it only opens on request. */
const KEY = "wg-wall-invite";

function emit() {
  for (const fn of listeners) fn();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

export function isOpen() {
  return open;
}

/** The server renders it closed; it is a client-side prompt. */
export function isOpenOnServer() {
  return false;
}

export function openInvite() {
  open = true;
  emit();
}

export function closeInvite() {
  open = false;
  emit();
}

/** True the first time this browser reaches the bottom, and never again. */
export function claimFirstVisit(): boolean {
  try {
    if (localStorage.getItem(KEY)) return false;
    localStorage.setItem(KEY, "1");
    return true;
  } catch {
    // storage blocked — better to ask once this session than to nag forever
    return false;
  }
}
