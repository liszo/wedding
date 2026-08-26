export type Moment = {
  when: string;
  title: string;
  body: string;
  image?: string;
};

export const story: Moment[] = [
  {
    when: "۱۳۹۸",
    title: "اولین بار",
    body: "اینجا بنویس کجا و چطور همدیگر را دیدید. دو سه جمله کافی است — کوتاه و ساده بهتر خوانده می‌شود.",
    image: "/story/1.jpg",
  },
  {
    when: "۱۴۰۰",
    title: "آن سفر",
    body: "خاطره‌ای که هر دو هنوز درباره‌اش حرف می‌زنید.",
    image: "/story/2.jpg",
  },
  {
    when: "۱۴۰۴",
    title: "بله",
    body: "لحظه‌ای که تصمیم گرفتید.",
  },
];