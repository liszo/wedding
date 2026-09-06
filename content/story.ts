import { wedding } from "./config";
import { photos, type Photo } from "./photos.generated";

export type Moment = {
  when: string;
  title: string;
  body: string;
  photo?: Photo;
  /** the chapter that hasn't happened yet — drawn as an open circle */
  upcoming?: boolean;
};

/**
 * Three ceremonies, in order: خواستگاری → بله‌برون → عروسی.
 * The copy is written to be true and short; swap in your own details freely.
 */
export const story: Moment[] = [
  {
    when: wedding.milestones.proposalFa,
    title: "خواستگاری",
    // Kept short on purpose: beside a 132px photo the text column is only
    // ~170px wide on a phone, and long sentences break to three words a line.
    body: "با یک دسته‌گل و کلی دلشوره رفتیم خانه‌شان. آن شب همه چیز با یک «بله» شروع شد.",
    photo: photos.proposal,
  },
  {
    when: wedding.milestones.engagementFa,
    title: "بله‌برون",
    body: "سفره چیده شد، شمع‌ها روشن و حلقه‌ها رد و بدل. کوچک، خودمانی، دقیقاً همان‌طور که می‌خواستیم.",
    photo: photos.ringMoment,
  },
  {
    when: `${wedding.weekdayFa} ${wedding.dateFa}`,
    title: "عروسی",
    body: "و حالا نوبت شماست. بدون شما این قصه ناتمام می‌ماند.",
    upcoming: true,
  },
];
