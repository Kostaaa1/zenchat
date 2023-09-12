import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://jdquxzvsrsawdbvjakvh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcXV4enZzcnNhd2Ridmpha3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2Njc4NTUsImV4cCI6MjAwODI0Mzg1NX0.Ef_mQkSy1-dSxyKJ0cHkS4KQxr5IvdED-Lq52udFedM"
);

export default supabase;
