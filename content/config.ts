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

  rsvpDeadlineISO: "2026-09-09T23:59:00+03:30",
  rsvpDeadlineFa: "۱۸ شهریور ۱۴۰۵",

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
    { at: "۲۳:۳۰", title: "بدرقه", note: "" },
  ],

  uploadCap: 20,
} as const;

export const coupleNames = `${wedding.brideName} و ${wedding.groomName}`;
