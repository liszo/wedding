/**
 * The one file to edit. Everything user-facing on the invitation reads from
 * here — names, dates, venue, running order, dress code.
 *
 * Anything marked TODO is a best guess and should be checked before you send
 * the links out.
 */
export const wedding = {
  brideName: "شقایق",
  groomName: "رامین",

  dateISO: "2026-09-23T19:00:00+03:30",
  dateFa: "۱ مهر ۱۴۰۵",
  weekdayFa: "چهارشنبه",
  timeFa: "ساعت ۷ عصر",
  durationHours: 5,

  /**
   * When the form stops accepting answers — or `null`, which is now, meaning
   * it never does. A guest who opens their link late still gets to reply
   * instead of a closed door and a note telling them to text you.
   *
   * `rsvpDeadlineFa` below is unaffected: it is the date the invitation *asks*
   * for a reply by, which is a request, not a lock. Set this back to an ISO
   * string and both the form and the API start enforcing it again — they read
   * the same function.
   */
  rsvpDeadlineISO: null as string | null,
  /** Printed as «لطفاً تا … پاسخ خود را ثبت کنید». ۲۲ شهریور ۱۴۰۵ = 13 Sep 2026. */
  rsvpDeadlineFa: "۲۲ شهریور ۱۴۰۵",

  venue: {
    name: "باغ تالار پردیسان",
    address:
      "پردیس، جاده باغ کمش، بعد از پل خلیج فارس، ۵۰۰ متر داخل جاده، پلاک ۱۰۰",

    /**
     * Neshan's own short link for the saved place. A `/maps/@lat,lng,zoom`
     * URL only centres the camera — it drops no pin. Only a `places/<id>`
     * link (and its nshn.ir short form) actually marks the spot.
     */
    neshan: "https://nshn.ir/_bv_CNPx3pie",

    // from the place link's own camera hash: #c35.733-51.797-15z
    lat: 35.733,
    lng: 51.797,
  },

  /** The two ceremonies already behind us. */
  milestones: {
    proposalFa: "۱۶ مرداد ۱۴۰۵",
    engagementFa: "۱۳ شهریور ۱۴۰۵",
  },

  /** Running order. */
  programme: [
    { at: "۱۸:۰۰", title: "مراسم عقد آریایی", note: "" },
    {
      at: "۱۹:۳۰",
      title: "ورود مهمان‌ها و پذیرایی",
      note: "همراه موسیقی و رقص",
    },
    { at: "۲۲:۰۰", title: "سرو شام", note: "" },
    { at: "۲۴:۰۰", title: "بدرقه", note: "" },
  ],

  uploadCap: 20,

  /**
   * The couple. These two can delete anything on the wall, from the wall
   * itself, without going through /admin and its password.
   *
   * Matched on phone number rather than name because the phone is the thing
   * that is already unique in guests.csv, and it is what identifies a guest
   * everywhere else in this project. `npm run guests` writes the flag onto the
   * rows; changing this list and re-running moves it.
   */
  hosts: ["09363093986", "09353968550"],
} as const;

export const coupleNames = `${wedding.brideName} و ${wedding.groomName}`;
