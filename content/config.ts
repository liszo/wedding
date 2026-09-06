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
    // TODO: these coordinates are the old ones — drop a pin on the real garden
    // and update, the map buttons and the .ics both read from here.
    lat: 35.73288835205472,
    lng: 51.79208425311717,
  },

  /** The two ceremonies already behind us. */
  milestones: {
    proposalFa: "۱۶ مرداد ۱۴۰۵",
    engagementFa: "۱۳ شهریور ۱۴۰۵",
  },

  /** Running order. `icon` keys into content/programme icons — see Programme.tsx. */
  programme: [
    { at: "۱۹:۰۰", title: "ورود مهمان‌ها", note: "پذیرایی در باغ", icon: "flower" },
    { at: "۲۰:۰۰", title: "مراسم عقد", note: "لطفاً سر ساعت", icon: "rings" },
    { at: "۲۱:۳۰", title: "شام", note: "", icon: "rose" },
    { at: "۲۲:۳۰", title: "موسیقی و رقص", note: "", icon: "champagne" },
    { at: "۲۴:۰۰", title: "بدرقه", note: "", icon: "heart" },
  ],

  uploadCap: 20,
} as const;

export const coupleNames = `${wedding.brideName} و ${wedding.groomName}`;
