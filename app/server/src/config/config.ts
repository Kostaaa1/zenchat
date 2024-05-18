import dotenv from "dotenv";
dotenv.config();

type ServerEnvVars = "PORT" | "CLIENT_URL" | "SUPABASE_API_URL" | "SUPABASE_API_KEY";
const envs: ServerEnvVars[] = ["PORT", "CLIENT_URL", "SUPABASE_API_URL", "SUPABASE_API_KEY"];

const processenv = () => {
  const missingVars = envs.filter((x) => !process.env[x]);
  if (missingVars.length > 0) {
    console.error(`Missing required env variables. Please add them to .env file: ${missingVars}`);
    process.exit(1);
  }

  const map = {} as { [key in ServerEnvVars]: string };
  envs.forEach((x) => {
    const e = process.env[x];
    if (e) map[x] = e;
  });

  return map;
};

const env = processenv();
export default env;
