import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [react()],
});

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd());
//   const API_URL = `${env.VITE_SERVER_URL ?? "http://localhost:3000"}`;
//   return {
//     server: {
//       proxy: {
//         "/api": {
//           target: API_URL,
//           changeOrigin: true,
//         },
//         "/socket.io": {
//           target: API_URL,
//           changeOrigin: true,
//           secure: false,
//           ws: true,
//         },
//       },
//     },
//     plugins: [react()],
//   };
// });
