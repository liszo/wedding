import { ORNAMENT } from "./ui";
import Reveal from "./Reveal";

export default function Greeting() {
  return (
    <Reveal>
      <div className="mx-auto max-w-[268px] text-center">
        <img
          src={ORNAMENT.crown}
          alt=""
          aria-hidden
          className="mx-auto mb-5 w-[64px]"
        />
        <p className="text-[14px] leading-[2.15] text-umber">
          قصه‌مون رسید به قشنگ‌ترین فصلش. خوشحال می‌شیم این شب به‌یادموندنی را
          کنار شما جشن بگیریم.
        </p>
        <p className="nastaliq mt-4 text-[21px] text-ink">منتظرتونیم</p>
      </div>
    </Reveal>
  );
}
