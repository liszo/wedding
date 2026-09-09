"use client";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { wedding } from "@/content/config";
import { toFa } from "@/lib/fa";
import * as invite from "@/lib/wall-invite";

/* "Are we on the client?", without a setState-in-effect mount flag. */
const NEVER = () => () => {};
const onClient = () => true;
const onServer = () => false;

const THINGS = [
  { icon: "📷", text: `تا ${toFa(wedding.uploadCap)} عکس از شب مراسم` },
  { icon: "💬", text: "پیام و آرزو برای ما" },
  { icon: "🎤", text: "پیام صوتی و استیکر" },
];

/**
 * The wall is the one part of the invitation a guest has to be told about —
 * everything else is on the page in front of them, and this is behind a link.
 *
 * So it is offered three ways: the empty frame at the end of the gallery, the
 * card above the footer, and this, once, when someone reaches the bottom
 * without having taken either. Once is the whole point: a prompt that returns
 * every visit is a nag, and a guest who has already seen the wall does not
 * need to be sold it again.
 */
export default function WallInvite() {
  const open = useSyncExternalStore(
    invite.subscribe,
    invite.isOpen,
    invite.isOpenOnServer
  );
  const mounted = useSyncExternalStore(NEVER, onClient, onServer);

  useEffect(() => {
    let done = false;

    function onScroll() {
      if (done) return;
      const left =
        document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      if (left > 240) return;
      done = true;
      window.removeEventListener("scroll", onScroll);
      if (invite.claimFirstVisit()) invite.openInvite();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={invite.closeInvite}
          className="fixed inset-0 z-[850] flex items-end justify-center bg-ink/50 backdrop-blur-[3px] sm:items-center sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wall-invite-h"
            initial={{ y: 44, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 44, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === "Escape" && invite.closeInvite()}
            className="wall-invite"
          >
            <p aria-hidden className="text-[34px] leading-none">
              💌
            </p>
            <p className="label mt-4">یک چیز دیگر</p>
            <h2 id="wall-invite-h" className="nastaliq mt-1 text-[26px] text-ink">
              دیوار ما
            </h2>
            <div aria-hidden className="rule mt-3 mb-5" />

            <p className="mx-auto mb-5 max-w-[250px] text-[12.5px] leading-[2] text-muted">
              یک صفحه‌ی خصوصی برای همه‌ی مهمان‌ها. عکس‌هایی که از شب مراسم
              می‌گیرید را همان‌جا بگذارید تا قاب‌های ما کامل شود.
            </p>

            <ul className="mb-6 flex flex-col gap-2.5 text-start">
              {THINGS.map((t) => (
                <li key={t.text} className="wall-invite-row">
                  <span aria-hidden>{t.icon}</span>
                  {t.text}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/wall"
                onClick={invite.closeInvite}
                className="rounded-full bg-umber py-3.5 text-center text-[12.5px] tracking-[0.06em] text-white transition hover:bg-ink"
              >
                رفتن به دیوار ما
              </Link>
              <button
                onClick={invite.closeInvite}
                className="rounded-full border border-taupe py-3.5 text-[12.5px] tracking-[0.06em] text-umber transition hover:bg-sunk"
              >
                بعداً
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
