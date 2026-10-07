"use client";

import { useSyncExternalStore } from "react";
import type { CartLine } from "../catalog/types";
import { isValidQuantity, lineKey, MAX_QUANTITY } from "./pricing";

/**
 * Client cart: an external store persisted to localStorage, synced across
 * tabs through the `storage` event. The server snapshot is always empty, so
 * SSR and hydration never mismatch; saved lines appear right after hydration.
 */

const STORAGE_KEY = "sb-cart-v1";

/** `hydrated` is false only in the server snapshot (before saved lines are read). */
type State = { lines: CartLine[]; isOpen: boolean; hydrated: boolean };

const SERVER_STATE: State = { lines: [], isOpen: false, hydrated: false };
let state: State = { ...SERVER_STATE, hydrated: true };
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    const lines: CartLine[] = [];
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const { productId, variantId, quantity } = item as Record<string, unknown>;
      if (typeof productId !== "string" || !isValidQuantity(quantity)) continue;
      const v = typeof variantId === "string" && variantId ? variantId : undefined;
      const key = lineKey(productId, v);
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(v ? { productId, variantId: v, quantity } : { productId, quantity });
    }
    return lines;
  } catch {
    return [];
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = { ...state, lines: parse(window.localStorage.getItem(STORAGE_KEY)) };
  } catch {
    // Storage blocked (private mode): the cart still works for this page view.
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return;
    state = { ...state, lines: parse(e.newValue) };
    emit();
  });
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: Partial<State>, persist = false) {
  state = { ...state, ...next };
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      // Ignore quota / blocked storage.
    }
  }
  emit();
}

const clamp = (q: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(q)));

export const cart = {
  add(productId: string, quantity: number, variantId?: string) {
    ensureLoaded();
    const key = lineKey(productId, variantId);
    const existing = state.lines.find((l) => lineKey(l.productId, l.variantId) === key);
    const lines = existing
      ? state.lines.map((l) => (l === existing ? { ...l, quantity: clamp(l.quantity + quantity) } : l))
      : [...state.lines, variantId ? { productId, variantId, quantity: clamp(quantity) } : { productId, quantity: clamp(quantity) }];
    setState({ lines }, true);
  },
  setQuantity(productId: string, quantity: number, variantId?: string) {
    ensureLoaded();
    if (!Number.isFinite(quantity)) return;
    const key = lineKey(productId, variantId);
    const lines = state.lines.map((l) =>
      lineKey(l.productId, l.variantId) === key ? { ...l, quantity: clamp(quantity) } : l,
    );
    setState({ lines }, true);
  },
  remove(productId: string, variantId?: string) {
    ensureLoaded();
    const key = lineKey(productId, variantId);
    setState({ lines: state.lines.filter((l) => lineKey(l.productId, l.variantId) !== key) }, true);
  },
  clear() {
    ensureLoaded();
    setState({ lines: [] }, true);
  },
  open() {
    setState({ isOpen: true });
  },
  close() {
    setState({ isOpen: false });
  },
};

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => {
  ensureLoaded();
  return state;
};
const getServerSnapshot = () => SERVER_STATE;

export function useCart() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    lines: s.lines,
    count: s.lines.reduce((n, l) => n + l.quantity, 0),
    isOpen: s.isOpen,
    hydrated: s.hydrated,
    add: cart.add,
    setQuantity: cart.setQuantity,
    remove: cart.remove,
    clear: cart.clear,
    open: cart.open,
    close: cart.close,
  };
}
