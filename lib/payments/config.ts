import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Service-role access (orders, coupons, enquiries) is available. */
export const isAdminDbConfigured = () => isSupabaseConfigured && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const isRazorpayConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/** Online payment can be taken end to end. */
export const paymentsReady = () => isAdminDbConfigured() && isRazorpayConfigured();
