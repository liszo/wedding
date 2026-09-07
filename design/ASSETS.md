# Design assets — شقایق و رامین wedding invitation

Everything the site's visual layer needs. Serve from `public/design/`, reference as
`/design/<folder>/<file>` — no imports, no bundler.

**Read this file before adding any decorative element. Never invent an asset path.
If what you need isn't listed here, say so rather than guessing.**

---

## What actually ships

`design/` is the library. `public/design/` is the subset the site serves, and it is
**generated** — do not hand-edit it:

```bash
npm run assets
```

> **The site currently serves almost nothing from this folder.**
>
> The design went minimal and nude: white, sand, warm umber, and no decorative imagery
> at all. Every rule, frame, monogram and the envelope itself are drawn in CSS. Of
> everything catalogued below, only `photos/`, `texture/paper-seamless.jpg` and **two**
> ornaments are shipped: `divider-braid-heart` (the rule under section headings) and
> `crown-lily` (the footer mark). Both are re-tinted from gold to the nude palette at
> build time — their RGB is replaced wholesale while alpha is left untouched, which is
> correct for art already keyed gold-on-transparent and preserves every soft edge.
>
> `florals/`, `ornaments/`, `icons/`, `persian/`, `seals/` and `vector-source/` are kept
> as a complete archive. They were used by two earlier directions (ivory tazhib, then
> botanical olive) which are in the git history. Nothing references them at runtime; the
> catalogue below stands so they are usable again without re-deriving what each file is.

`scripts/prepare-assets.ts` crops every photograph, maps it through the duotone curve,
compresses it to WebP at two sizes, shrinks the six reaction stickers (1MB of PNG → 88KB
of WebP), and writes `content/photos.generated.ts` so every `<img>` knows its intrinsic
size and nothing reflows. Sources and generated output are both committed — Vercel builds
from git.

**All photographs are duotone**, mapped through one warm three-stop curve:
`#4A423C` (shadow) → `#C9B8AC` (midtone) → `#FAF7F3` (highlight). A flat `sharp.tint()`
cannot produce this — it scales toward a single colour and leaves midtones neutral, which
reads as grey with a cast rather than toned. The midtone stop is where skin sits.

---

## Rules

1. **PNGs in `ornaments/`, `icons/` and `persian/` are pre-tinted antique gold (`#A8935C`).**
   They were recoloured by luminance remap, so antialiasing is preserved. Do not apply CSS
   filters to change their colour — re-export from `vector-source/` instead.
2. **On dark bands, use `filter: brightness(1.32)`** to lift the gold. That is the one filter
   that is fine.
3. **Never stretch a frame.** `frame-arch-peony-gold.png` has a fixed 1086:1448 aspect.
   Use `aspect-ratio` and `background-size: contain`, never `100% 100%`.
4. **`paper-seamless.jpg` is the only tileable texture.** The originals in `design-source/` are not
   seamless and will show a visible grid if repeated.
5. **`lace-scallop-*` and `border-illuminated-*` tile horizontally.** Use
   `background: url(...) repeat-x center / auto <height>px`.
6. **Everything in `florals/` and `seals/` has a real transparent background**, cut by
   flood fill from the image edges so interior whites survived. Drop them on any colour.
7. **Nothing here is a raw purchase.** Every file has been cropped, keyed, tinted or tiled
   for use. The untouched originals live in `design-source/` at the project root, outside
   `public/`, and must never be referenced from code.
8. **Everything in `photos/` is a source file, never referenced from code.** The site
   reads `content/photos.generated.ts`, which points at the cropped WebP in
   `public/design/photos/`. Change a crop in `scripts/prepare-assets.ts`, not here.
9. **Do not mix `persian/` with `florals/` or `ornaments/`.** Illumination and botanical
   line art are different registers and fight each other. The site went botanical, so
   `persian/` stays unserved — keep it that way unless the whole page changes register.

---

## photos/

Sources for the invitation. Only the files in the **Ships as** column are rendered;
everything else is kept because it may be wanted again.

| File | Size | Ships as | What it is |
|---|---|---|---|
| `new-hero.webp` | 1426×2016 | `hero` | **The hero**, full-bleed and uncropped. Couple centre-right, a phone in the foreground, and empty wall panelling top-left — that corner is where the names sit, so do not crop it away. |
| `bale-boron.webp` | 1426×2016 | `baleBoron` | The بله‌برون chapter. **Currently byte-identical to `new-hero.webp`** (same md5), so the same frame appears twice on the page. Almost certainly a copy slip — drop the intended photo in under this name and re-run `npm run assets`. |
| `story-1.jpg` | 860×1150 | `proposal` | The خواستگاری chapter. Couple with the orange-peach bouquet, Persian miniature behind. |
| `gallery1.jpg` | 600×800 | `gallery1` | Proposal evening — bouquet, Turkish lamps, hallway. |
| `gallery2.jpg` | 800×633 | `gallery2` | Seated on the sofreh, wide, both faces to camera. |
| `gallery3.jpg` | 785×800 | `gallery3` | Seated, looking at each other, chandelier overhead. |
| `gallery4.jpg` | 600×800 | `gallery4` | Standing portrait, candles behind. |
| `gallery5.jpg` | 800×600 | `gallery5` | The ring, hands sharp, couple soft behind. |
| `story-5.jpg` | 2560×1920 | `og` | Link-preview image only — a 1.9:1 landscape crop with both faces and the ring. |
| `hero.jpg`, `story-2/3/4/6/7/8/9.jpg` | various | *(unused)* | The engagement set used by earlier directions. Full descriptions are in the git history of this file. |

**Still worth shooting:** nothing here shows the wedding venue (باغ تالار پردیسان).

---

## texture/

| File | Size | What it is |
|---|---|---|
| `paper-seamless.jpg` | 320×320 | **Mirror-tiled, truly seamless.** Tile at 160–180px, 40–55% opacity. The only texture that should ever be used with `repeat`. |

---

## seals/

For the envelope gate. One per palette direction.

| File | Size | What it is |
|---|---|---|
| `wax-seal-crimson-heart.png` | 253×256 | Burgundy wax, heart emblem. Original colour, background keyed. |
| `wax-seal-crimson-rose.png` | 239×250 | Burgundy wax, rose emblem. Original colour, background keyed. For the tazhib direction. |
| `wax-seal-olive-heart.png` | 240×240 | Deep olive wax, heart emblem. Recoloured from crimson by luminance remap. For the sage/olive direction. |

---

## florals/

Photographic and watercolour cutouts, transparent. Use these to straddle section seams —
half on one band, half on the next. That overlap is what makes a shaped transition read as
intentional.

| File | Size | What it is |
|---|---|---|
| `calla-lilies-tall.png` | 254×746 | Taller calla crop, full resolution. |
| `calla-lilies.png` | 210×373 | Translucent calla lilies, sage-white. Elegant vertical accent. |
| `eucalyptus-branch.png` | 300×450 | Single eucalyptus branch. Low-opacity background accent. |
| `eucalyptus-cluster.png` | 460×690 | Dense eucalyptus cluster. Heavy — resize before use. |
| `eucalyptus-watercolour.png` | 340×532 | Watercolour eucalyptus, softer edge. |
| `floral-arch-blush.png` | 400×390 | Blush and white stone floral arch. Warmer alternative. |
| `floral-arch-white.png` | 560×555 | Full white floral wedding arch with drapes. Used as the venue illustration. |
| `peony-spray.png` | 300×297 | White peony spray with foliage. Corner piece. |
| `rose-cascade.png` | 340×541 | White rose and greenery cascade. Best seam-straddling floral — hangs well over a dome crest. |
| `rose-sheet.png` | 480×720 | Sheet of 15 individual cream roses on transparent. Crop what you need. |
| `rose-single-bud.png` | 150×132 | One cream rose bud, cropped from the sheet. |
| `rose-single-open.png` | 130×112 | One open cream rose, cropped from the sheet. |
| `rose-spray-corner.png` | 250×278 | Cream roses with eucalyptus, corner composition. |

---

## ornaments/

Gold line art. Dividers, wreaths, corners, frames.

| File | Size | What it is |
|---|---|---|
| `ampersand-leaves-gold.png` | 220×111 | Ampersand flanked by leaves. Footer mark, or between two names. |
| `arch-poppy-gold.png` | 348×198 | Poppy arch, spans a heading like a canopy. |
| `corner-daisy-scatter-gold.png` | 300×414 | Daisy and scatter corner. Pairs with the above, rotated 180°. |
| `corner-leaf-vertical-gold.png` | 299×373 | Vertical leafy corner. Top-left of a panel. |
| `crown-lily-gold.png` | 211×124 | Small lily crown. Above a heading. |
| `divider-braid-heart-gold.png` | 420×24 | Thin braided rule with a centre heart. Lightest divider — use between story chapters. |
| `divider-floral-fine-gold.png` | 420×94 | Fine floral rule with a centre bloom. Section mark on dark bands. |
| `divider-floral-symmetric-gold.png` | 420×60 | Symmetric floral rule. Mid-weight, good above a card. |
| `divider-leaf-heart-gold.png` | 508×59 | Leaf rule with a heart, wide. |
| `divider-leaf-heart-wide-gold.png` | 451×67 | Leaf rule with a heart, widest variant. |
| `divider-leaf-thin-gold.png` | 420×81 | Slim leaf-and-swirl rule. Under section headings. |
| `frame-arch-peony-gold.png` | 620×826 | Full gold arch frame with peonies. Aspect 1086:1448 — **respect it**, never stretch. Content needs ~70px top and bottom padding inside. |
| `lace-scallop-dome-gold.png` | 760×98 | Repeating lace scallop strip. **Tiles horizontally** — lay along a scalloped section edge. |
| `lace-scallop-fine-gold.png` | 760×121 | Finer lace scallop strip. Also tiles. |
| `sprig-olive-branch-gold.png` | 200×611 | Tall single olive branch. Vertical accent beside a heading. |
| `wreath-branch-gold.png` | 400×350 | Loose branch circle with berries. |
| `wreath-eucalyptus-gold.png` | 420×354 | Open eucalyptus wreath. Text sits inside it — the greeting panel. |
| `wreath-leaf-circle-gold.png` | 360×345 | Closed leaf circle. Tighter; good for a monogram. |

---

## icons/

Programme icons. Sized for a ~20px box inside a 40px circle; use `object-fit: contain`
because the aspect ratios differ.

| File | Size | What it is |
|---|---|---|
| `champagne-glasses-gold.png` | 110×155 | Two glasses toasting. Programme: music and celebration. |
| `flower-gold.png` | 110×40 | Small flower with leaves, wide. Programme: guest arrival. |
| `heart-arrow-gold.png` | 110×58 | Heart pierced by an arrow. Programme: farewell. |
| `rings-gold.png` | 120×99 | Two interlocking rings with hearts. Programme: ceremony. |
| `rose-stem-gold.png` | 90×237 | Single rose on a stem, tall. Programme: dinner. |

---

## persian/

Only for the tazhib (ivory / lapis / gold) direction. Do not mix these with the botanical
ornaments above — they belong to different registers and will fight each other.

| File | Size | What it is |
|---|---|---|
| `border-illuminated-1-gold.png` | 700×111 | Illuminated border strip. Tiles horizontally. Edge every dark band, mirrored on the lower edge. |
| `border-illuminated-2-gold.png` | 700×111 | Second illuminated border, denser. |
| `border-illuminated-3-gold.png` | 760×123 | Third illuminated border, tallest arcade. |
| `boteh-gold.png` | 90×67 | Single boteh (paisley). Small separator between story chapters. |
| `eslimi-medallion-gold.png` | 280×281 | Arabesque medallion frame. Recurring section mark in the tazhib direction. |
| `shamseh-medallion-gold.png` | 320×320 | Radial shamseh. Large watermark at 8–13% opacity behind a band. |

---

## vector-source/

91 original SVGs, renamed by what they are. Recolour and re-export from here whenever a gold
PNG is the wrong size or the wrong colour. Categories by filename prefix:

- `divider-*` — horizontal rules (23)
- `sprig-*` — single stems and branches (10)
- `wreath-*` — circular and open frames (7)
- `icon-*` — wedding icons (8)
- `corner-*` — corner pieces (4)
- `crest-*` — folk crowns and crests, coloured (7)
- `medallion-*` — radial ornaments (3)
- `boteh-*` — paisley motifs (4)
- `border-*` — repeating strips (7)
- `lace-scallop-*` — scalloped lace strips (4)
- `frame-*` — enclosing frames (2)
- misc: `ampersand-leaves`, `lettering-love`, `leaf-single`, `arrow-vertical`, `flower-poppy-colour`

To recolour one: rasterise at 2× the intended display width, then remap every pixel to the
target colour with `alpha = original_alpha × (1 − luminance)`. That keeps the antialiasing.
A flat `-colorize` will produce hard, ugly edges.

---

## Source archive — kept OUTSIDE this folder

Original purchases and rejects live in `design-source/` at the **project root**, not in
`public/`. Anything under `public/` is deployed to Vercel, and that archive is 47MB.
Add `design-source/` to `.gitignore`.

It contains:

- `paper-embossed-source.png`, `paper-embossed-alt.jpg` — the un-tiled originals
- `wax-seal-green-clover-UNKEYED.png` — has a grey background baked in
- `heavy-svg/` — twelve "SVGs" that are actually embedded rasters, 450KB to 11MB each.
  They render, but they are not vectors and will wreck the bundle. Rasterise and key them
  by hand if you want any of them.

---

## Still missing

- A photograph of the wedding venue (باغ تالار پردیسان)
- Self-hosted `Gulzar` and `Vazirmatn` woff2 files — those belong in `public/fonts/`, not
  here. Currently both come from the `@fontsource` packages, which is fine but means the
  font CSS is bundled rather than preloaded.

## Done

- ~~A decision on which photo fills the hero slot~~ — `story-8.jpg`
- ~~Cropping and compression pass over the eight raw engagement photos~~ — `npm run assets`
