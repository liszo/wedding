/**
 * Shared music state, as a module-level store rather than React context.
 *
 * Two components need to agree: the consent modal that asks the question, and
 * the floating player that owns the <audio> element and sits at the bottom of
 * the page. A store lets the modal start playback *inside its own click
 * handler* — which matters, because autoplay policies only allow play() during
 * a user gesture, and a play() fired from an effect after a state change can
 * fall outside that window.
 */

export type Choice = "yes" | "no" | null;

const KEY = "wg-music";

const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;
/** Mirrors sessionStorage, and is the whole answer when storage is blocked. */
let cached: Choice = null;
let hydrated = false;

function read(): Choice {
  if (!hydrated) {
    try {
      const v = sessionStorage.getItem(KEY);
      cached = v === "yes" || v === "no" ? v : null;
    } catch {
      cached = null; // private mode — ask again, it costs one tap
    }
    hydrated = true;
  }
  return cached;
}

function emit() {
  for (const fn of listeners) fn();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

export function getChoice(): Choice {
  return read();
}

/** The server has no session, so it always renders as "already answered". */
export function getServerChoice(): Choice {
  return "no";
}

/** Called by the player once its <audio> is in the DOM. */
export function registerAudio(el: HTMLAudioElement | null) {
  audio = el;
}

/**
 * Record the guest's answer. Call this straight from a click handler: when the
 * answer is yes it starts playback immediately, while the gesture still counts.
 */
export function choose(next: Exclude<Choice, null>) {
  cached = next;
  hydrated = true;
  try {
    sessionStorage.setItem(KEY, next);
  } catch {
    // ignore — the in-memory value carries the session
  }
  if (next === "yes") {
    audio?.play().catch(() => {
      // blocked or failed to decode; the floating button still works
    });
  }
  emit();
}
