// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Substitua pelos seus dados do Supabase
const SUPABASE_URL = "https://byhqhcmqurjctyzlipra.supabase.co";
const SUPABASE_KEY = "sb_publishable_3qYi0_suRsWOPvj9Z1PQCA_PvrUIOEH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
