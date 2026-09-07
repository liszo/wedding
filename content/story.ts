import { wedding } from "./config";
import { photos, type Photo } from "./photos.generated";

export type Moment = {
  when: string;
  title: string;
  /** absent on the chapter that hasn't happened yet */
  photo?: Photo;
};

/**
 * Three ceremonies, in order: خواستگاری → بله‌برون → عروسی.
 *
 * Date and title only — the photographs carry the rest. The wedding has no
 * photograph, which is the point: Story.tsx renders that chapter as still
 * loading.
 */
export const story: Moment[] = [
  {
    when: wedding.milestones.proposalFa,
    title: "خواستگاری",
    photo: photos.proposal,
  },
  {
    when: wedding.milestones.engagementFa,
    title: "بله‌برون",
    photo: photos.baleBoron,
  },
  {
    when: `${wedding.weekdayFa} ${wedding.dateFa}`,
    title: "عروسی",
  },
];
