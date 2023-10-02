import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
const { SUPABASE_API_URL = "", SUPABASE_API_KEY = "" } = process.env;

const supabase = createClient(SUPABASE_API_URL, SUPABASE_API_KEY);
export default supabase;
