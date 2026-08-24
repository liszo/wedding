export const DIR = -1;

export const slideIn = {
  hidden: { opacity: 0, x: 40 * DIR },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 30 },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 30 },
  },
};

export const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};