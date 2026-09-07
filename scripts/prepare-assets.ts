/**
 * Turns the raw `design/` library into the shipped `public/design/` set.
 *
 * Crops every photograph, maps it through the nude duotone curve, and writes
 * both a view image and a thumbnail as WebP. Re-tints the two ornament marks
 * from their gold masters. Shrinks the reaction stickers.
 *
 * Writes content/photos.generated.ts so layout knows intrinsic sizes and
 * never reflows.
 *
 *   npx tsx scripts/prepare-assets.ts
 */
import { mkdir, copyFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "design");
const OUT = path.join(ROOT, "public", "design");

/** Folders copied through untouched. `texture` is the only tileable JPEG. */
const COPY_FOLDERS = ["texture"];

/* ---------------------------------------------------------------------------
   Duotone.

   Every photograph is mapped through one warm tone curve so the whole site
   reads as a single material. Three stops, interpolated piecewise:

     shadow  #4A423C   midtone #C9B8AC   highlight #FAF7F3

   A flat sharp `.tint()` cannot do this — it scales toward one colour, which
   leaves midtones neutral and the result reads as grey-with-a-cast rather than
   toned. The midtone stop is the whole point: it is where skin sits.
--------------------------------------------------------------------------- */
type Rgb = [number, number, number];

const SHADOW: Rgb = [0x4a, 0x42, 0x3c];
const MID: Rgb = [0xc9, 0xb8, 0xac];
const HIGH: Rgb = [0xfa, 0xf7, 0xf3];

/** 256-entry lookup, luminance -> toned rgb. */
function buildLut(): Uint8Array {
  const lut = new Uint8Array(256 * 3);
  for (let l = 0; l < 256; l++) {
    const t = l / 255;
    // two linear segments meeting at the midtone
    const [from, to, k] =
      t < 0.5 ? [SHADOW, MID, t * 2] : [MID, HIGH, (t - 0.5) * 2];
    for (let c = 0; c < 3; c++) {
      lut[l * 3 + c] = Math.round(from[c] + (to[c] - from[c]) * k);
    }
  }
  return lut;
}

const LUT = buildLut();

/** Flatten to luminance, then push every pixel through the curve. */
async function duotone(pipe: Sharp): Promise<Sharp> {
  const { data, info } = await pipe
    .grayscale()
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.allocUnsafe(info.width * info.height * 3);
  for (let i = 0, o = 0; i < data.length; i++, o += 3) {
    const at = data[i] * 3;
    out[o] = LUT[at];
    out[o + 1] = LUT[at + 1];
    out[o + 2] = LUT[at + 2];
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 3 },
  });
}

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
    alt: "شقایق و رامین در مراسم بله‌برون",
  },
  {
    // the بله‌برون chapter
    id: "baleBoron",
    src: "bale-boron.webp",
    view: 1000,
    thumb: 640,
    alt: "شقایق و رامین در شب بله‌برون",
  },
  {
    // the خواستگاری chapter — the only frame from that evening
    id: "proposal",
    src: "story-1.jpg",
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
    id: "gallery6",
    src: "khonche.jpg",
    view: 1100,
    thumb: 620,
    alt: "خونچه",
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

    // a touch of contrast before the curve, so the toning has range to work in
    pipe = await duotone(pipe.linear(1.06, -8));

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
  await ornaments();
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
