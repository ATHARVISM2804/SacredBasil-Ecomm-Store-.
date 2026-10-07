"use client";

import { useSyncExternalStore } from "react";
import type { CatalogResponse } from "./types";

/**
 * Client-side catalogue for the drawer and cart pages: fetched once per page
 * load from /api/catalog and shared by every consumer. Prices shown from it
 * are for display; the server re-prices every order.
 */

export type CatalogState =
  | { status: "loading"; data: null }
  | { status: "ready"; data: CatalogResponse }
  | { status: "error"; data: null };

const LOADING: CatalogState = { status: "loading", data: null };
let state: CatalogState = LOADING;
let started = false;
const listeners = new Set<() => void>();

function load(fresh = false) {
  if (started) return;
  started = true;
  fetch("/api/catalog", fresh ? { cache: "no-store" } : undefined)
    .then((r) => (r.ok ? (r.json() as Promise<CatalogResponse>) : Promise.reject(new Error(String(r.status)))))
    .then((data) => {
      state = { status: "ready", data };
    })
    .catch(() => {
      state = { status: "error", data: null };
      started = false; // allow a retry on the next subscription
    })
    .finally(() => listeners.forEach((l) => l()));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => listeners.delete(listener);
}

export function useCatalog(): CatalogState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );
}

/** Re-fetches the catalogue (e.g. after the server reports changed prices). */
export function refreshCatalog() {
  started = false;
  load(true);
}
