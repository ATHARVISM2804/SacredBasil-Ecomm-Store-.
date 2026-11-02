"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { lenisStore } from "@/components/ui/MotionProvider";
import { cn } from "@/lib/utils";

/** "all" or "essential"; read this before adding any analytics. */
export const CONSENT_KEY = "sb-consent";
/** Time the Diwali invitation was last closed. */
export const INVITE_KEY = "sb-diwali-invite";
const INVITE_REST_MS = 3 * 24 * 60 * 60 * 1000;

/** Pages where nothing should interrupt. */
const QUIET = ["/admin", "/checkout", "/cart", "/account"];

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
};

/**
 * First-visit sequence: the cookie bar along the bottom, then, once a choice
 * is made, the Diwali invitation. Never both at once.
 */
export function WelcomeLayer() {
  const pathname = usePathname();
  const quiet = QUIET.some((p) => pathname.startsWith(p));
  const [stage, setStage] = useState<"wait" | "cookies" | "invite" | "done">("wait");

  useEffect(() => {
    if (quiet || stage !== "wait") return;
    const resting = Date.now() - Number(read(INVITE_KEY) ?? 0) < INVITE_REST_MS;
    const next = !read(CONSENT_KEY) ? "cookies" : resting ? "done" : "invite";
    const id = window.setTimeout(() => setStage(next), next === "invite" ? 2500 : 700);
    return () => window.clearTimeout(id);
  }, [quiet, stage]);

  const choose = (value: "all" | "essential") => {
    write(CONSENT_KEY, value);
    const resting = Date.now() - Number(read(INVITE_KEY) ?? 0) < INVITE_REST_MS;
    setStage("done");
    if (!resting) window.setTimeout(() => setStage("invite"), 1200);
  };

  const closeInvite = () => {
    write(INVITE_KEY, String(Date.now()));
    setStage("done");
  };

  if (quiet) return null;
  return (
    <>
      <CookieBar show={stage === "cookies"} onChoose={choose} />
      {stage === "invite" && <DiwaliInvite onClose={closeInvite} />}
    </>
  );
}

function CookieBar({ show, onChoose }: { show: boolean; onChoose: (v: "all" | "essential") => void }) {
  return (
    <section
      aria-label="Cookie preferences"
      inert={!show}
      className={cn(
        "fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-5xl bg-chocolate-deep text-ivory shadow-[0_20px_60px_-20px_rgb(20_12_8/0.6)] transition-[transform,opacity,visibility] duration-700 ease-[var(--ease-editorial)] md:inset-x-6 md:bottom-6",
        "mb-[env(safe-area-inset-bottom)]",
        show ? "visible translate-y-0 opacity-100" : "invisible translate-y-[120%] opacity-0",
      )}
    >
      <div className="flex flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:gap-10 md:px-8 md:py-6">
        <div className="min-w-0 flex-1">
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-champagne">Cookies</p>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-ivory/80">
            We use essential cookies to keep your bag and preferences, and, with your permission, a few more to
            understand how the site is used.{" "}
            <Link href="/privacy" className="text-ivory underline underline-offset-4">
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 md:flex">
          <button
            type="button"
            onClick={() => onChoose("essential")}
            className="btn btn-outline-light justify-center px-5"
          >
            Essential only
          </button>
          <button type="button" onClick={() => onChoose("all")} className="btn btn-light justify-center px-5">
            Accept all
          </button>
        </div>
      </div>
    </section>
  );
}

function DiwaliInvite({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    lenisStore.current?.stop();
    return () => {
      lenisStore.current?.start();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="invite-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="invite m-auto w-[min(calc(100%-1.5rem),56rem)] max-h-[calc(100dvh-1.5rem)] max-w-none overflow-y-auto bg-ivory p-0 text-cocoa backdrop:bg-[rgb(20_12_8/0.55)] backdrop:backdrop-blur-[2px]"
    >
      <div className="grid md:grid-cols-[1fr_1.05fr]">
        <div className="relative aspect-[16/10] bg-cream md:aspect-auto md:min-h-[32rem]">
          <Image
            src="/images/v6/g-luxe-lineup.webp"
            alt="The Sacred Basil Luxe kit and its five handcrafted pieces"
            fill
            sizes="(min-width: 768px) 28rem, 100vw"
            className="object-cover object-[50%_60%] md:object-[72%_50%]"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-8 text-center md:px-12 md:py-14">
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-gold">The Diwali Gifting Collection</p>
          <h2 id="invite-title" className="display-section mt-4 text-chocolate">
            Gift the glow of Diwali.
          </h2>
          <p className="mx-auto mt-4 max-w-xs text-[0.98rem] leading-relaxed text-cocoa/75">
            Handcrafted gift sets, finished by hand in Pune. Made to order, so reserve yours early.
          </p>
          <Link
            href="/collections#gift-sets"
            onClick={() => ref.current?.close()}
            className="btn btn-primary mt-8 justify-center"
          >
            Explore Diwali gifts
            <ArrowRight aria-hidden className="btn-arrow size-3.5" strokeWidth={1.25} />
          </Link>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="mt-3 min-h-11 text-[0.85rem] text-cocoa/60 underline-offset-4 hover:underline"
          >
            Maybe later
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => ref.current?.close()}
        aria-label="Close"
        className="absolute right-2 top-2 grid size-11 place-items-center bg-ivory/85 text-chocolate md:bg-transparent"
      >
        <X aria-hidden className="size-5" strokeWidth={1.25} />
      </button>
    </dialog>
  );
}
