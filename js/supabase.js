import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://dbfeqstukmfdgdopkzum.supabase.co";
const supabaseKey = "sb_publishable_0ML1O6SRkCCZeFIEgwb7Tw_gdxKQwy0";

export const db = createClient(supabaseUrl, supabaseKey)
