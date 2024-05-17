import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import env from "./config";

const { SUPABASE_API_URL, SUPABASE_API_KEY } = env;
const supabase = createClient<Database>(SUPABASE_API_URL, SUPABASE_API_KEY);
export default supabase;
