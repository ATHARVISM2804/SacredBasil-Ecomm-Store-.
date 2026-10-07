/**
 * Shapes of the `settings` rows edited in /admin/settings.
 * The storefront and checkout read these same keys.
 */
export type AnnouncementSetting = {
  text: string;
  link?: string;
  linkLabel?: string;
};

/**
 * separate:  shipping is quoted/charged separately (not added at checkout)
 * flat:      `flatFee` rupees on every order
 * free_over: free when subtotal >= `freeOver`, otherwise `flatFee`
 */
export type ShippingSetting = {
  mode: "separate" | "flat" | "free_over";
  flatFee?: number;
  freeOver?: number;
  note: string;
};

export const SHIPPING_MODES: ShippingSetting["mode"][] = ["separate", "flat", "free_over"];
