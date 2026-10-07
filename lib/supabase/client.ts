"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";

export const createSupabaseBrowserClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey);
