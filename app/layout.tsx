import type { Metadata, Viewport } from "next";
import { wedding, coupleNames } from "@/content/config";
import { photos } from "@/content/photos.generated";
import "./globals.css";

/**
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL; locally there is nothing to
 * resolve against, so fall back to localhost. Without a metadataBase the OG
 * image resolves relative and link previews come out blank.
 */
const site = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

const title = `عروسی ${coupleNames}`;
const description = `${wedding.weekdayFa} ${wedding.dateFa} — ${wedding.venue.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title,
  description,
  applicationName: title,
  // A private invitation. robots.txt disallows crawling; this is the belt to
  // that pair of braces, and it also asks link previewers not to index.
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    title,
    description,
    siteName: title,
    images: [
      {
        url: photos.og.src,
        width: photos.og.w,
        height: photos.og.h,
        alt: coupleNames,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [photos.og.src],
  },
  appleWebApp: { capable: true, title, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // matches the ground the frame floats on, so the browser chrome blends in
  themeColor: "#c9c1ae",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  // guests will pinch to look at the photographs — do not take that away
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">
        <a
          href="#story"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-200 focus:rounded-lg focus:bg-olive focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
        >
          رفتن به محتوا
        </a>
        {children}
      </body>
    </html>
  );
}
