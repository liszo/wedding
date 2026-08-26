import { getGuest } from "@/lib/guest";
import LostLinkModal from "@/components/LostLinkModal";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Ceremony from "@/components/Ceremony";

export default async function Home() {
  const guest = await getGuest();

  return (
    <main>
      <Hero guestName={guest?.name} />
      <Countdown />
      <Ceremony />

      {!guest && (
        <div className="pb-16 text-center">
          <LostLinkModal />
        </div>
      )}
    </main>
  );
}