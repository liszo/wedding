/**
 * Turns the raw `design/` library into the shipped `public/design/` set.
 *
 * Two jobs:
 *   1. Copy the flat PNG/JPG assets the tazhib direction actually uses.
 *      Botanical ornaments and florals are deliberately NOT copied — see
 *      design/ASSETS.md, they belong to the other visual register.
 *   2. Crop and compress the ten photographs. Eight are raw camera exports
 *      (up to 736KB); each becomes a WebP view image and a WebP thumbnail,
 *      desaturated to ~95% so no frame fights the ivory/lapis palette.
 *
 * Writes content/photos.generated.ts so layout knows intrinsic sizes and
 * never reflows.
 *
 *   npx tsx scripts/prepare-assets.ts
 */
import { mkdir, copyFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "design");
const OUT = path.join(ROOT, "public", "design");

/** Folders copied through untouched. `texture` is the only tileable JPEG. */
const COPY_FOLDERS = ["texture"];

/**
 * Transparent PNGs re-encoded as WebP at native size — no crop, no resize, just
 * a format change. Together `florals/` and `ornaments/` are 1.9MB of PNG; the
 * subset below is what the botanical direction actually places on the page.
 */
const ALPHA_FILES = [
  // florals — these straddle the section seams
  "florals/rose-cascade.png",
  "florals/peony-spray.png",
  "florals/rose-spray-corner.png",
  "florals/eucalyptus-watercolour.png",
  "florals/eucalyptus-branch.png",
  "florals/calla-lilies.png",
  "florals/floral-arch-white.png",

  // ornaments — section marks, dividers, the greeting wreath
  "ornaments/wreath-eucalyptus-gold.png",
  "ornaments/crown-lily-gold.png",
  "ornaments/arch-poppy-gold.png",
  "ornaments/ampersand-leaves-gold.png",
  "ornaments/sprig-olive-branch-gold.png",
  "ornaments/corner-leaf-vertical-gold.png",
  "ornaments/divider-leaf-thin-gold.png",
  "ornaments/divider-braid-heart-gold.png",
  "ornaments/divider-floral-symmetric-gold.png",
  "ornaments/divider-leaf-heart-wide-gold.png",
  "ornaments/lace-scallop-fine-gold.png",

  // programme pictograms
  "icons/flower-gold.png",
  "icons/rings-gold.png",
  "icons/rose-stem-gold.png",
  "icons/champagne-glasses-gold.png",
  "icons/heart-arrow-gold.png",

  // the gate's seal — olive, to match the band colour
  "seals/wax-seal-olive-heart.png",
];

type Slot = {
  /** key used in content/photos.generated.ts */
  id: string;
  src: string;
  /** left/top/width/height in source pixels, omitted to use the whole frame */
  crop?: { left: number; top: number; width: number; height: number };
  /** long-edge cap for the view image */
  view: number;
  /** long-edge cap for the thumbnail */
  thumb: number;
  alt: string;
  /** JPEG instead of WebP — only the link-preview image needs this */
  jpeg?: boolean;
  /** warm-toned black and white, for the full-bleed hero */
  mono?: boolean;
};

const SLOTS: Slot[] = [
  {
    // The full-bleed hero. 1920x2560 portrait already; taken down to 4:5 so a
    // phone screen still has room for the dome that rises over it.
    id: "hero",
    src: "story-8.jpg",
    crop: { left: 0, top: 0, width: 1920, height: 2400 },
    view: 1500,
    thumb: 800,
    mono: true,
    alt: "شقایق و رامین در مراسم بله‌برون",
  },
  {
    // the same frame in colour, for the story timeline
    id: "heroColour",
    src: "story-8.jpg",
    crop: { left: 0, top: 0, width: 1920, height: 2400 },
    view: 1100,
    thumb: 700,
    alt: "شقایق و رامین در مراسم بله‌برون",
  },
  {
    // Link previews in WhatsApp/Telegram want landscape. story-5 is the only
    // frame with both faces AND the ring that survives a 1.9:1 crop.
    id: "og",
    src: "story-5.jpg",
    crop: { left: 0, top: 250, width: 2560, height: 1344 },
    view: 1200,
    thumb: 600,
    alt: "شقایق و رامین",
    // WhatsApp — the channel these links actually travel on — is unreliable
    // with WebP link previews. This one stays JPEG.
    jpeg: true,
  },
  {
    id: "proposal",
    src: "story-1.jpg",
    view: 1100,
    thumb: 700,
    alt: "دسته‌گل خواستگاری",
  },
  {
    id: "proposalSquare",
    src: "story-2.jpg",
    view: 700,
    thumb: 560,
    alt: "خواستگاری",
  },
  {
    id: "ringMoment",
    src: "story-5.jpg",
    // 2560x1920 landscape -> 4:5 portrait centred on the joined hands
    crop: { left: 482, top: 0, width: 1536, height: 1920 },
    view: 1400,
    thumb: 760,
    alt: "لحظه‌ی دست کردن حلقه",
  },
  {
    id: "venue",
    src: "story-7.jpg",
    view: 1600,
    thumb: 820,
    alt: "چیدمان سفره‌ی بله‌برون",
  },
  {
    id: "ringBouquet",
    src: "story-6.jpg",
    view: 1500,
    thumb: 800,
    alt: "حلقه روی دسته‌گل سفید و آبی",
  },
  {
    id: "sofreh",
    src: "story-3.jpg",
    view: 1300,
    thumb: 720,
    alt: "جزئیات سفره‌ی عقد",
  },
  {
    id: "ringDetail",
    src: "hero.jpg",
    view: 1500,
    thumb: 800,
    alt: "حلقه‌ی نامزدی",
  },
  {
    id: "candlelit",
    src: "story-4.jpg",
    // 240x320 source — never upscaled, thumbnail duty only
    view: 320,
    thumb: 320,
    alt: "لحظه‌ای در نور شمع",
  },
  {
    id: "tableau",
    src: "story-9.jpg",
    view: 800,
    thumb: 600,
    alt: "نمای کامل سفره",
  },
];

type Meta = { src: string; w: number; h: number; thumb: string; tw: number; th: number; alt: string };

async function copyFolder(name: string) {
  const from = path.join(SRC, name);
  const to = path.join(OUT, name);
  await mkdir(to, { recursive: true });
  for (const file of await readdir(from)) {
    await copyFile(path.join(from, file), path.join(to, file));
  }
  console.log(`  ${name}/  ${(await readdir(from)).length} files`);
}

async function render(slot: Slot): Promise<Meta> {
  const input = path.join(SRC, "photos", slot.src);
  const dir = path.join(OUT, "photos");
  await mkdir(dir, { recursive: true });

  async function one(cap: number, suffix: string, quality: number) {
    let pipe = sharp(input).rotate();
    if (slot.crop) pipe = pipe.extract(slot.crop);
    // withoutEnlargement keeps the two low-res sources at native size
    pipe = pipe.resize({
      width: cap,
      height: cap,
      fit: "inside",
      withoutEnlargement: true,
    });

    if (slot.mono) {
      // Not a plain desaturate. Neutral grey reads cold against warm ivory, so
      // this is a platinum-print treatment: strip colour, lift contrast a
      // little, then tint the whites back toward the paper.
      pipe = pipe
        .grayscale()
        .linear(1.08, -10)
        .tint({ r: 252, g: 246, b: 235 });
    } else {
      pipe = pipe.modulate({ saturation: 0.95 });
    }

    const buf = await (slot.jpeg
      ? pipe.jpeg({ quality, progressive: true, mozjpeg: true })
      : pipe.webp({ quality, effort: 6})
    ).toBuffer({ resolveWithObject: true });

    const name = `${slot.id}${suffix}.${slot.jpeg ? "jpg" : "webp"}`;
    await writeFile(path.join(dir, name), buf.data);
    return { url: `/design/photos/${name}`, w: buf.info.width, h: buf.info.height, bytes: buf.data.length };
  }

  const view = await one(slot.view, "", 78);
  const thumb = await one(slot.thumb, "-t", 70);

  console.log(
    `  ${slot.id.padEnd(15)} ${String(view.w).padStart(4)}x${String(view.h).padEnd(4)} ` +
      `${String(Math.round(view.bytes / 1024)).padStart(4)}KB  +thumb ${Math.round(thumb.bytes / 1024)}KB`
  );

  return { src: view.url, w: view.w, h: view.h, thumb: thumb.url, tw: thumb.w, th: thumb.h, alt: slot.alt };
}

/**
 * Re-encode the transparent PNGs as WebP at native size. Nothing is resized —
 * these are line art and watercolour cutouts whose masters are already close to
 * their display size, and upscaling gold hairlines just softens them.
 */
async function alphaAssets() {
  let before = 0;
  let after = 0;

  for (const file of ALPHA_FILES) {
    const from = path.join(SRC, file);
    const to = path.join(OUT, file.replace(/\.png$/, ".webp"));
    await mkdir(path.dirname(to), { recursive: true });

    const buf = await sharp(from)
      .webp({ quality: 88, effort: 6, alphaQuality: 100 })
      .toBuffer();

    before += (await stat(from)).size;
    after += buf.length;
    await writeFile(to, buf);
  }

  console.log(
    `  ${ALPHA_FILES.length} transparent assets  ` +
      `${Math.round(before / 1024)}KB PNG -> ${Math.round(after / 1024)}KB WebP`
  );
}

/**
 * The six reaction stickers ship at 147-205KB of PNG each — a megabyte of
 * transparency for something drawn at 20-56px. Two WebP sizes replace them.
 */
async function stickers() {
  const from = path.join(SRC, "stickers");
  const to = path.join(ROOT, "public", "stickers");
  await mkdir(to, { recursive: true });

  for (const file of await readdir(from)) {
    if (!file.endsWith(".png")) continue;
    const id = path.basename(file, ".png");
    for (const [suffix, size] of [
      ["", 112], // 56px sticker comment at 2x
      ["-s", 48], // 24px inline at 2x
    ] as const) {
      const buf = await sharp(path.join(from, file))
        .resize(size, size, { fit: "inside" })
        .webp({ quality: 82, effort: 6, alphaQuality: 90 })
        .toBuffer();
      await writeFile(path.join(to, `${id}${suffix}.webp`), buf);
    }
  }
  console.log(`  stickers/  ${(await readdir(to)).length} files`);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log("copying flat assets");
  for (const folder of COPY_FOLDERS) await copyFolder(folder);
  await alphaAssets();
  await stickers();

  console.log("\nrendering photographs");
  const entries: [string, Meta][] = [];
  for (const slot of SLOTS) entries.push([slot.id, await render(slot)]);

  const body = `// GENERATED by scripts/prepare-assets.ts — do not edit by hand.
// Run \`npx tsx scripts/prepare-assets.ts\` after changing anything in design/photos/.

export type Photo = {
  src: string;
  w: number;
  h: number;
  thumb: string;
  tw: number;
  th: number;
  alt: string;
};

export const photos = ${JSON.stringify(Object.fromEntries(entries), null, 2)} as const satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;
`;

  await writeFile(path.join(ROOT, "content", "photos.generated.ts"), body, "utf8");
  console.log("\nwrote content/photos.generated.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
