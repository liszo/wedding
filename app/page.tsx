import Link from "next/link";
import { getGuest } from "@/lib/guest";
import { getMyRsvp } from "@/lib/rsvp-read";
import { rsvpClosed } from "@/lib/rsvp";
import LostLinkModal from "@/components/LostLinkModal";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Story from "@/components/Story";
import Ceremony from "@/components/Ceremony";
import Rsvp from "@/components/Rsvp";
import MusicPlayer from "@/components/MusicPlayer";

export default async function Home() {
  const guest = await getGuest();
  const mine = guest ? await getMyRsvp(guest.id) : null;

  return (
    <main>
      <Hero guestName={guest?.name} />
      <Countdown />
      <Story />
      <Ceremony />

      {guest ? (
        <Rsvp initial={mine} closed={rsvpClosed()} />
      ) : (
        <div className="pb-16 text-center">
          <LostLinkModal />
        </div>
      )}
      <div className="pb-10 text-center">
      <Link
        href="/wall"
        className="rounded-xl bg-candle/10 px-6 py-3 text-sm text-candle ring-1 ring-candle/20"
      >
        دیوار ما
      </Link>
    </div>
      <footer className="pb-28 text-center text-xs text-mist/25">
        منتظر دیدنت هستیم
      </footer>

      <MusicPlayer />
    </main>
  );
}