import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://tmcrnwgagxocspjttqbv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY3Jud2dhZ3hvY3NwanR0cWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE3ODQ3MDMsImV4cCI6MjAwNzM2MDcwM30.IXXNjLRdHLUPyt9E3HnfkUR-TmgxyfaZ5uCrw9KTrxE"
);

export default supabase;
