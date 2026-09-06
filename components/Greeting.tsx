import { ORNAMENT } from "./ui";
import Reveal from "./Reveal";

/**
 * The greeting sits inside the eucalyptus wreath rather than beside it. The
 * wreath is an image with a real transparent interior, so the text is just
 * absolutely centred inside its box — no masking needed.
 */
export default function Greeting() {
  return (
    <Reveal>
      <div className="relative mx-auto max-w-[330px] text-center">
        <img
          src={ORNAMENT.wreath}
          alt=""
          aria-hidden
          className="block w-full opacity-90"
        />
        {/* the wreath's clear opening is about 58% of its width — the padding
            keeps the copy inside it rather than sitting on the leaves */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[68px]">
          <p className="eyebrow">با یاد و نام خدا</p>
          <h2 className="nastaliq text-[23px] text-olive-ink">خوش آمدید</h2>
          <p className="mt-0.5 text-[11.5px] leading-[1.85] text-muted">
            حضور شما بزرگ‌ترین هدیه‌ی این روز است.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
