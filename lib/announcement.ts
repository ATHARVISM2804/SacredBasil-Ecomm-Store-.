import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { AnnouncementSetting } from "@/lib/admin/settings";

/** Shown until an announcement is saved in /admin/settings. */
const DEFAULT_ANNOUNCEMENT: AnnouncementSetting = {
  text: "Diwali gifting: reserve your festive production slot early.",
  link: "/corporate-gifting#enquire",
  linkLabel: "Enquire now",
};

/**
 * The `announcement` settings row for the bar above the header. Null when
 * the admin has blanked the text (the bar is hidden).
 */
export async function loadAnnouncement(): Promise<AnnouncementSetting | null> {
  if (!isSupabaseConfigured) return DEFAULT_ANNOUNCEMENT;
  const { data, error } = await createSupabasePublicClient()
    .from("settings")
    .select("value")
    .eq("key", "announcement")
    .maybeSingle();
  if (error) throw new Error(`Could not load the announcement: ${error.message}`);
  if (!data) return DEFAULT_ANNOUNCEMENT;
  const v = data.value as Record<string, unknown> | null;
  const text = typeof v?.text === "string" ? v.text.trim() : "";
  if (!text) return null;
  const link = typeof v?.link === "string" && v.link ? v.link : undefined;
  const linkLabel = typeof v?.linkLabel === "string" && v.linkLabel ? v.linkLabel : undefined;
  return link && linkLabel ? { text, link, linkLabel } : { text };
}
