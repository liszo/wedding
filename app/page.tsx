import { getGuest } from "@/lib/guest";
import { getMyRsvp } from "@/lib/rsvp-read";
import { rsvpClosed } from "@/lib/rsvp";
import LostLinkModal from "@/components/LostLinkModal";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Ceremony from "@/components/Ceremony";
import Rsvp from "@/components/Rsvp";

export default async function Home() {
  const guest = await getGuest();
  const mine = guest ? await getMyRsvp(guest.id) : null;

  return (
    <main>
      <Hero guestName={guest?.name} />
      <Countdown />
      <Ceremony />

      {guest ? (
        <Rsvp initial={mine} closed={rsvpClosed()} />
      ) : (
        <div className="pb-16 text-center">
          <LostLinkModal />
        </div>
      )}
    </main>
  );
}