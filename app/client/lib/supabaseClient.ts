import { createClient } from "@supabase/supabase-js";
const { VITE_SUPABASE_API_URL, VITE_SUPABASE_API_KEY } = import.meta.env;

const supabase = createClient(VITE_SUPABASE_API_URL, VITE_SUPABASE_API_KEY);

export default supabase;
