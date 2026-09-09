/**
 * Turns the raw `design/` library into the shipped `public/design/` set.
 *
 * Crops every photograph and writes both a view image and a thumbnail as WebP.
 * Photographs keep their own colour; only the hero is treated, and only to
 * black and white. Tones the wax seal and re-tints the two ornament marks from
 * their gold masters. Shrinks the reaction stickers.
 *
 * Writes content/photos.generated.ts so layout knows intrinsic sizes and
 * never reflows.
 *
 *   npx tsx scripts/prepare-assets.ts
 */
import { mkdir, copyFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { STICKERS } from "../content/stickers";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "design");
const OUT = path.join(ROOT, "public", "design");

/** Folders copied through untouched. `texture` is the only tileable JPEG. */
const COPY_FOLDERS = ["texture"];

type Rgb = [number, number, number];

/* Photographs ship in their own colour. Only the hero is treated, and only to
   black and white — see the `mono` flag on its slot. */

/* ---------------------------------------------------------------------------
   The wax seal.

   Same idea as the photographs, but the master is burgundy wax with real
   three-dimensional shading and a keyed background — so the tone curve has to
   run over luminance while the alpha channel passes through untouched. A flat
   RGB swap (what the ornaments get) would erase the modelling and leave a
   silhouette.

   Toned warmer and deeper than the photographs so it still reads as wax
   against the nude envelope rather than as a smudge.
--------------------------------------------------------------------------- */
const SEAL_STOPS: [Rgb, Rgb, Rgb] = [
  [0x3b, 0x30, 0x2a],
  [0x8b, 0x72, 0x63],
  [0xd6, 0xc6, 0xb8],
];

async function seal() {
  const dir = path.join(OUT, "seals");
  await mkdir(dir, { recursive: true });

  const src = path.join(SRC, "seals/wax-seal-crimson-heart.png");
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [lo, mid, hi] = SEAL_STOPS;
  for (let i = 0; i < data.length; i += 4) {
    // Rec. 709 luma; the alpha at i + 3 is left exactly as it is
    const l =
      (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    const [from, to, k] =
      l < 0.5 ? [lo, mid, l * 2] : [mid, hi, (l - 0.5) * 2];
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(from[c] + (to[c] - from[c]) * k);
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .webp({ quality: 90, effort: 6, alphaQuality: 100 })
    .toFile(path.join(dir, "wax-heart.webp"));

  console.log("  seals/  1 toned");
}

/* ---------------------------------------------------------------------------
   Ornaments.

   Two marks, and only two — a rule under section headings and one footer
   mark. The masters are pre-tinted antique gold (#A8935C), which is too warm
   and too saturated beside a nude palette, so the RGB is replaced wholesale
   while the alpha channel is kept exactly as it is.

   That is the right way round for this art: it is already keyed gold-on-
   transparent, so the antialiasing lives in the alpha. Swapping RGB and
   leaving alpha alone preserves every soft edge. (ASSETS.md rule 1 forbids a
   CSS filter for this, not a re-tint at build time.)

   Nothing else from florals/, icons/, persian/ or seals/ is served.
--------------------------------------------------------------------------- */
const ORNAMENT_TINT: Rgb = [0xbc, 0xa8, 0x94];

const ORNAMENTS = [
  "ornaments/divider-braid-heart-gold.png", // under section headings
  "ornaments/crown-lily-gold.png", // the footer mark
];

async function ornaments() {
  const dir = path.join(OUT, "ornaments");
  await mkdir(dir, { recursive: true });

  for (const file of ORNAMENTS) {
    const { data, info } = await sharp(path.join(SRC, file))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
      data[i] = ORNAMENT_TINT[0];
      data[i + 1] = ORNAMENT_TINT[1];
      data[i + 2] = ORNAMENT_TINT[2];
      // data[i + 3] — alpha untouched
    }

    const out = path.join(
      dir,
      path.basename(file).replace(/-gold\.png$/, ".webp")
    );
    await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .webp({ quality: 90, effort: 6, alphaQuality: 100 })
      .toFile(out);
  }
  console.log(`  ornaments/  ${ORNAMENTS.length} re-tinted`);
}

/* ---------------------------------------------------------------------------
   Florals — the only two, and both only for the envelope gate.

   The redesign is otherwise floral-free. These are the exception: they are the
   flowers that rise out of the pocket when the envelope opens, and they never
   appear on the invitation itself.

   Two different masters, deliberately. One spray used twice — even mirrored —
   reads as a single butterfly rather than as two bunches of flowers.

   Both are desaturated on the way through. The masters are painted at full
   strength and their greens fight a nude palette; pulled back they sit with it.

   Both are trimmed first: the masters are mostly transparent margin, and
   shipping that margin would multiply the file size for nothing.
--------------------------------------------------------------------------- */
const FLORALS = [
  // the trailing spray, on the left
  { file: "florals/rose-cascade.png", out: "rose-cascade.webp", width: 260, saturation: 0.5, trim: true },
  // the fuller, rounder one, on the right
  { file: "florals/peony-spray.png", out: "peony-spray.webp", width: 240, saturation: 0.5, trim: true },
] as const;

async function florals() {
  const dir = path.join(OUT, "florals");
  await mkdir(dir, { recursive: true });

  let total = 0;
  for (const f of FLORALS) {
    let pipe = sharp(path.join(SRC, f.file));
    if (f.trim) pipe = pipe.trim();
    const buf = await pipe
      .resize({ width: f.width, withoutEnlargement: true })
      .modulate({ saturation: f.saturation })
      .webp({ quality: 74, effort: 6, alphaQuality: 88 })
      .toBuffer({ resolveWithObject: true });
    await writeFile(path.join(dir, f.out), buf.data);
    total += buf.data.length;
    console.log(
      `  florals/${f.out.padEnd(20)} ${buf.info.width}x${buf.info.height}  ${Math.round(buf.data.length / 1024)}KB`
    );
  }
  console.log(`  florals/  ${FLORALS.length} toned, ${Math.round(total / 1024)}KB total`);
}

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
  /** black and white — the hero, and nothing else */
  mono?: boolean;
};

const SLOTS: Slot[] = [
  {
    // The full-bleed hero, uncropped at its native 1426x2016. The couple sits
    // centre-right and the top-left is empty wall — that space is where the
    // names go, so cropping it away would defeat the composition.
    id: "hero",
    src: "new-hero.webp",
    view: 1400,
    thumb: 760,
    mono: true,
    alt: "شقایق و رامین در مراسم بله‌برون",
  },
  {
    // the بله‌برون chapter
    id: "baleBoron",
    src: "bale-boron.jpg",
    view: 1000,
    thumb: 640,
    alt: "شقایق و رامین در شب بله‌برون",
  },
  {
    // the خواستگاری chapter
    id: "proposal",
    src: "khastegari.webp",
    view: 1000,
    thumb: 640,
    alt: "شقایق و رامین در شب خواستگاری",
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
    id: "gallery1",
    src: "gallery1.jpg",
    view: 1100,
    thumb: 620,
    alt: "قابی از شب بله‌برون",
  },
  {
    id: "gallery2",
    src: "gallery2.jpg",
    view: 1100,
    thumb: 620,
    alt: "قابی از شب بله‌برون",
  },
  {
    id: "gallery3",
    src: "gallery3.jpg",
    view: 1100,
    thumb: 620,
    alt: "قابی از شب بله‌برون",
  },
  {
    id: "gallery4",
    src: "gallery4.jpg",
    view: 1100,
    thumb: 620,
    alt: "قابی از شب بله‌برون",
  },
  {
    id: "gallery5",
    src: "gallery5.jpg",
    view: 1100,
    thumb: 620,
    alt: "قابی از شب بله‌برون",
  },
  {
    // Not in the gallery — this one is the ground the روزشمار band is printed
    // on. It has to stay recognisable, so it ships big enough to hold up
    // behind a full-width band rather than at thumbnail size.
    id: "khoncheBg",
    src: "khonche.jpg",
    view: 1100,
    thumb: 620,
    alt: "خونچه‌ی عروس",
  },
  // The three frames that come out of the envelope when it opens.
  {
    id: "envelope1",
    src: "envelope1.jpg",
    view: 720,
    thumb: 420,
    alt: "شقایق و رامین",
  },
  {
    id: "envelope2",
    src: "envelope2.jpg",
    view: 720,
    thumb: 420,
    alt: "شقایق و رامین",
  },
  {
    id: "envelope3",
    src: "envelope3.jpg",
    view: 720,
    thumb: 420,
    alt: "شقایق و رامین",
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

    // The hero is the one treated frame: stripped to black and white with a
    // small contrast lift, baked in rather than applied as a CSS filter so the
    // browser never paints the colour version first. Everything else ships as
    // it was shot.
    if (slot.mono) pipe = pipe.grayscale().linear(1.06, -8);

    const buf = await (slot.jpeg
      ? pipe.jpeg({ quality, progressive: true, mozjpeg: true })
      : pipe.webp({ quality, effort: 6 })
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
 * The reaction stickers ship at 147-205KB of PNG each — a megabyte of
 * transparency for something drawn at 20-56px. Two WebP sizes replace them.
 *
 * It walks the declared set in content/stickers.ts, not the folder. Globbing
 * `design/stickers/*.png` meant that dropping a master in there silently
 * shipped it, whether or not anything referenced it — and the masters are
 * ~2MB each. A sticker exists when it is declared; the file is just where its
 * art lives.
 */
async function stickers() {
  const from = path.join(SRC, "stickers");
  const to = path.join(ROOT, "public", "stickers");
  await mkdir(to, { recursive: true });

  const present = new Set(await readdir(from));

  for (const s of STICKERS) {
    const file = s.file ?? `${s.id}.png`;
    const id = s.id;
    if (!present.has(file)) {
      console.warn(`  ⚠ stickers/${file} declared but missing`);
      continue;
    }
    for (const [suffix, size] of [
      ["", 260], // the 128px sticker message at 2x
      ["-s", 56], // the 28px inline uses at 2x
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
  await ornaments();
  await florals();
  await seal();
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
