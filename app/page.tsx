import Link from "next/link";
import { getGuest } from "@/lib/guest";
import { getMyRsvp } from "@/lib/rsvp-read";
import { rsvpClosed } from "@/lib/rsvp";
import LostLinkModal from "@/components/LostLinkModal";
import LinkNotice from "@/components/LinkNotice";
import MusicGate from "@/components/MusicGate";
import Envelope from "@/components/Envelope";
import Hero from "@/components/Hero";
import Greeting from "@/components/Greeting";
import Calendar from "@/components/Calendar";
import Countdown from "@/components/Countdown";
import Story from "@/components/Story";
import Gallery from "@/components/Gallery";
import Programme from "@/components/Programme";
import Ceremony from "@/components/Ceremony";
import Rsvp from "@/components/Rsvp";
import MusicPlayer from "@/components/MusicPlayer";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { photos } from "@/content/photos.generated";
import { Band, SectionHead, Seam } from "@/components/ui";

/**
 * One 430px card. The photograph bleeds to the edges; everything after it sits
 * inside `.card-body`, which draws a single ruled border down the whole length
 * of the page — the engraved rule a printed invitation carries.
 *
 * Bands alternate white and nude. Each `<Seam>` carries the ground of the band
 * above it, so the colour change happens cleanly below the rule rather than
 * through it.
 */
export default async function Home({ searchParams }: PageProps<"/">) {
  const [guest, params] = await Promise.all([getGuest(), searchParams]);
  const mine = guest ? await getMyRsvp(guest.id) : null;
  const error = Array.isArray(params.e) ? params.e[0] : params.e;

  return (
    <>
      <MusicGate />
      <Envelope guestName={guest?.name} />

      <main className="frame">
        <LinkNotice code={error} />

        <Hero />

        <div className="card-body">
          <Band>
            <Greeting />
          </Band>

          <Seam />

          <Band tone="nude" photo={photos.khoncheBg.src}>
            <Reveal>
              <SectionHead label="تا آن روز" title="روزشمار" className="mb-8" />
              <Countdown />
              <Calendar />
            </Reveal>
          </Band>

          <Seam tone="nude" />

          <Band id="story" labelledBy="story-h">
            <Story />
          </Band>

          <Seam />

          <Band tone="nude" id="gallery" labelledBy="gallery-h">
            <Gallery />
          </Band>

          <Seam tone="nude" />

          <Band id="programme" labelledBy="programme-h">
            <Programme />
          </Band>

          <Seam />

          <Band tone="nude" id="ceremony" labelledBy="ceremony-h">
            <Ceremony />
          </Band>

          <Seam tone="nude" />

          <Band id="rsvp" labelledBy="rsvp-h">
            <Reveal>
              <SectionHead
                id="rsvp-h"
                label="مشتاقانه منتظریم"
                title="تأیید حضور"
                className="mb-9"
              />
            </Reveal>

            <Reveal delay={0.05}>
              {guest ? (
                <Rsvp initial={mine} closed={rsvpClosed()} />
              ) : (
                <div className="mx-auto max-w-[300px] text-center">
                  <p className="mb-3 text-[13px] leading-[2] text-muted">
                    برای ثبت پاسخ، با لینک دعوت خودت وارد شو.
                  </p>
                  <LostLinkModal />
                </div>
              )}
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-12 text-center">
                <Link
                  href="/wall"
                  className="inline-block rounded-full border border-taupe px-8 py-3 text-[12.5px] tracking-[0.06em] text-umber transition hover:bg-sunk"
                >
                  دیوار ما
                </Link>
              </div>
            </Reveal>
          </Band>

          <Seam />

          <Footer />
        </div>

        <MusicPlayer />
      </main>
    </>
  );
}
