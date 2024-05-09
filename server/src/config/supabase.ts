import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
const { SUPABASE_API_URL = "", SUPABASE_API_KEY = "" } = process.env;

const supabase = createClient<Database>(SUPABASE_API_URL, SUPABASE_API_KEY);
export default supabase;
