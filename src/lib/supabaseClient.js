import { createClient } from "@supabase/supabase-js";

// Bu iki değer "publishable / anon" anahtarlardır — Supabase'in kendi
// dokümantasyonuna göre tarayıcıda görünmeleri güvenlidir, veri güvenliği
// Row Level Security (RLS) politikalarıyla sağlanır (bkz. supabase/schema.sql).
const SUPABASE_URL = "https://pbrvakayvusgecpgodpi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zGRC65W7qT1K3Z-z6Xb3ew_blp27JMz";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
