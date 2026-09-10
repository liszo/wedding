/**
 * Phone numbers, in the two shapes this guest list actually contains.
 *
 * Iranian numbers stay in the local form they have always been stored in —
 * `09XXXXXXXXX` — because sixty-odd rows, the host list in content/config.ts
 * and every link already sent out are keyed on it. Moving everyone to E.164
 * would be tidier on a blank page and is not worth rewriting live data for.
 *
 * Everything else is stored as E.164: `+` and the full number, country code
 * included. The `+` is what distinguishes the two, and it is also the only
 * honest way to write a foreign number down — «4383355765» is not a number
 * anyone can dial, and without the country code there is nothing to say
 * whether a bare string is Iranian or Canadian.
 */

const FA = "۰۱۲۳۴۵۶۷۸۹";
const AR = "٠١٢٣٤٥٦٧٨٩";

export function normalizePhone(raw: string): string {
  const s = raw
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))
    .trim();

  // An explicit international prefix — `+` or a `00` trunk code — is the
  // signal. Without one the number is read as Iranian, which is what every
  // existing row in the list is.
  const international = /^\s*(\+|00)/.test(s);
  let d = s.replace(/\D/g, "");

  if (international && d.startsWith("00")) d = d.slice(2);

  if (!international || d.startsWith("98")) {
    // Iran, local form: strip the country code and any trunk zero, then put
    // exactly one back.
    if (d.startsWith("98")) d = d.slice(2);
    if (d.startsWith("0")) d = d.slice(1);
    return "0" + d;
  }

  return "+" + d;
}

/** Iranian mobiles are 09 followed by nine digits. */
const IR = /^09\d{9}$/;
/** Anything else: a country code and a subscriber number, E.164's own limits. */
const INTL = /^\+[1-9]\d{7,14}$/;

/**
 * Whether a number is one this list can hold. Used to keep the "lost my link"
 * button disabled until there is something worth sending, and by the seeding
 * script to reject a row rather than write a number nobody can be found by.
 * The server re-checks regardless.
 */
export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  return IR.test(p) || INTL.test(p);
}
