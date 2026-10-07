"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Save-for-later heart. Signed-in customers toggle the product in their
 * wishlist (RLS: owner only); everyone else is sent to sign in. Renders
 * nothing until accounts are configured. One shared fetch per page load.
 */

type WishState =
  | { status: "loading" | "anon" | "disabled"; userId: null; ids: ReadonlySet<string> }
  | { status: "ready"; userId: string; ids: ReadonlySet<string> };

const EMPTY: ReadonlySet<string> = new Set();
const INITIAL: WishState = { status: isSupabaseConfigured ? "loading" : "disabled", userId: null, ids: EMPTY };
let state: WishState = INITIAL;
let started = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function load() {
  if (started || !isSupabaseConfigured) return;
  started = true;
  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      state = { status: "anon", userId: null, ids: EMPTY };
    } else {
      const { data: rows } = await supabase.from("wishlist_items").select("product_id");
      state = {
        status: "ready",
        userId: data.user.id,
        ids: new Set((rows ?? []).map((r: { product_id: string }) => r.product_id)),
      };
    }
  } catch {
    state = { status: "anon", userId: null, ids: EMPTY };
  }
  emit();
}

async function toggle(productId: string) {
  if (state.status !== "ready") return;
  const { userId, ids } = state;
  const had = ids.has(productId);
  const next = new Set(ids);
  if (had) next.delete(productId);
  else next.add(productId);
  state = { ...state, ids: next };
  emit();

  const supabase = createSupabaseBrowserClient();
  const { error } = had
    ? await supabase.from("wishlist_items").delete().eq("user_id", userId).eq("product_id", productId)
    : await supabase.from("wishlist_items").upsert({ user_id: userId, product_id: productId });
  if (error && state.status === "ready") {
    // Roll back the optimistic change.
    const rollback = new Set(state.ids);
    if (had) rollback.add(productId);
    else rollback.delete(productId);
    state = { ...state, ids: rollback };
    emit();
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  void load();
  return () => listeners.delete(l);
}

export function WishlistButton({
  productId,
  productName,
  className,
  withLabel = false,
}: {
  productId: string;
  productName: string;
  className?: string;
  withLabel?: boolean;
}) {
  const s = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  const pathname = usePathname();

  if (s.status === "disabled") return null;

  const saved = s.ids.has(productId);
  const classes = cn(
    "inline-flex items-center gap-2 text-cocoa/75 transition-colors hover:text-chocolate disabled:opacity-50",
    !withLabel && "size-10 justify-center",
    className,
  );
  const icon = (
    <Heart aria-hidden className={cn("size-5", saved && "fill-current text-chocolate")} strokeWidth={1.25} />
  );

  if (s.status === "anon") {
    return (
      <Link
        href={`/account/login?next=${encodeURIComponent(pathname)}`}
        className={classes}
        aria-label={withLabel ? undefined : `Sign in to save ${productName} to your wishlist`}
      >
        {icon}
        {withLabel && <span className="eyebrow">Save to wishlist</span>}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void toggle(productId)}
      disabled={s.status === "loading"}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : `${saved ? "Remove" : "Save"} ${productName} ${saved ? "from" : "to"} wishlist`}
      className={classes}
    >
      {icon}
      {withLabel && <span className="eyebrow">{saved ? "Saved to wishlist" : "Save to wishlist"}</span>}
    </button>
  );
}
