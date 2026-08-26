import { getGuest } from "@/lib/guest";
import LostLinkModal from "@/components/LostLinkModal";
import { wedding } from "@/content/config";

export default async function Home() {
  const guest = await getGuest();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      {guest ? (
        <h1 className="text-3xl font-bold">{guest.name} عزیز، خوش آمدی</h1>
      ) : (
        <h1 className="text-3xl font-bold">به دعوت‌نامه‌ی ما خوش آمدید</h1>
      )}

      <p className="text-lg opacity-70">{wedding.dateFa}</p>

      {!guest && <LostLinkModal />}
    </main>
  );
}