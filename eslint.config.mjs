import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Every image on this site is a static WebP that scripts/prepare-assets.ts
      // has already cropped, desaturated and compressed to its display size,
      // with width/height set at the call site so nothing reflows. next/image
      // would re-optimise them at request time and bill for the privilege.
      // The one exception — guest uploads on the wall — is compressed in the
      // browser by lib/compress.ts before it is ever sent.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
