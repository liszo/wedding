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

const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;

/**
 * The answer lives for exactly one page load and is deliberately not persisted.
 *
 * It used to sit in sessionStorage, which meant a guest who came back to the
 * link saw neither the question nor the envelope again. It also could not have
 * worked: a remembered "yes" cannot start the audio on the next load, because
 * autoplay needs a gesture and a restored value is not one. Asking again costs
 * one tap and is the only thing that actually plays the music.
 */
let choice: Choice = null;

function emit() {
  for (const fn of listeners) fn();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

export function getChoice(): Choice {
  return choice;
}

/**
 * The server renders the question too — unanswered, exactly as the client
 * first paints it. Returning "answered" here is what used to let the whole
 * invitation paint for a frame before the overlay took over, which read as the
 * page flashing up and then being snatched away.
 */
export function getServerChoice(): Choice {
  return null;
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
  choice = next;
  if (next === "yes") {
    audio?.play().catch(() => {
      // blocked or failed to decode; the floating button still works
    });
  }
  emit();
}
