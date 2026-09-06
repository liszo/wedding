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
import { Band, Scallop, Seam, SectionHead, FLORAL, ORNAMENT } from "@/components/ui";

/**
 * The whole invitation is one 430px column of alternating paper and olive
 * bands. Read the order of <Band>, <Scallop> and <Seam> below and you have the
 * page: paper domes swell up over what precedes them, olive bands are entered
 * through a lace scallop, and a floral straddles most of the joins.
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

        {/* paper rises over the photograph; roses hang across the crest */}
        <Band dome className="pb-12">
          <Seam
            src={FLORAL.cascade}
            width={132}
            style={{ top: -46, insetInlineStart: -18 }}
          />
          <Seam
            src={FLORAL.peony}
            width={124}
            style={{ top: -30, insetInlineEnd: -12 }}
          />
          <Greeting />
        </Band>

        <Scallop from="paper" to="olive" />

        {/* ── olive: the date ── */}
        <Band tone="olive" className="pre-dome pt-9">
          <Seam
            src={FLORAL.branch}
            width={104}
            style={{ top: 8, insetInlineEnd: -30, opacity: 0.5 }}
          />
          <Reveal>
            <SectionHead
              eyebrow="تا آن روز"
              title="روزشمار"
              mark={ORNAMENT.ruleFloral}
              under={null}
              tone="olive"
              className="mb-6"
            />
            <Calendar />
            <Countdown />
          </Reveal>
        </Band>

        {/* ── paper: the story ── */}
        <Band dome id="story" labelledBy="story-h">
          <Seam
            src={FLORAL.corner}
            width={118}
            style={{ top: -34, insetInlineEnd: 6 }}
          />
          <Story />
        </Band>

        <Scallop from="paper" to="olive" />

        {/* ── olive: the gallery. Photographs gain from the dark ground ── */}
        <Band tone="olive" id="gallery" labelledBy="gallery-h" className="pre-dome pt-9">
          <Gallery />
        </Band>

        {/* ── paper: the programme ── */}
        <Band dome id="programme" labelledBy="programme-h">
          <Seam
            src={ORNAMENT.sprig}
            width={58}
            style={{ top: -14, insetInlineEnd: 16, opacity: 0.75 }}
          />
          <Seam
            src={FLORAL.peony}
            width={112}
            style={{ top: -40, insetInlineStart: -22 }}
          />
          <Programme />
        </Band>

        <Scallop from="paper" to="olive" />

        {/* ── olive: the venue. The arch illustration is white on transparent,
              so it reads as light here and would vanish on paper ── */}
        <Band tone="olive" id="ceremony" labelledBy="ceremony-h" className="pre-dome pt-9">
          <Ceremony />
        </Band>

        {/* ── paper: RSVP ── */}
        <Band dome id="rsvp" labelledBy="rsvp-h">
          <Seam
            src={FLORAL.corner}
            width={110}
            style={{ top: -30, insetInlineStart: -14 }}
          />
          <Reveal>
            <SectionHead
              id="rsvp-h"
              eyebrow="مشتاقانه منتظریم"
              title="تأیید حضور"
              mark={ORNAMENT.crown}
              under={null}
            />
          </Reveal>

          <Reveal delay={0.05}>
            {guest ? (
              <Rsvp initial={mine} closed={rsvpClosed()} />
            ) : (
              <div className="mx-auto max-w-[330px] rounded-[20px] border border-gold-pale bg-paper-lite/70 p-7 text-center">
                <p className="mb-3 text-[13px] leading-[1.9] text-muted">
                  برای ثبت پاسخ، با لینک دعوت خودت وارد شو.
                </p>
                <LostLinkModal />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 text-center">
              <Link
                href="/wall"
                className="inline-block rounded-xl border border-olive px-7 py-3 text-[12.5px] text-olive transition hover:bg-olive/8"
              >
                دیوار ما
              </Link>
            </div>
          </Reveal>
        </Band>

        <Scallop from="paper" to="olive" />

        <Footer />

        <MusicPlayer />
      </main>
    </>
  );
}
