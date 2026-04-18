/**
 * Server-only Supabase client with service role for admin operations
 * (e.g. backfilling track cover_url). Do not use in client components.
 */
import { createClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}
