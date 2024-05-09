import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://zenchat-ev4z.onrender.com",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "https://zenchat-ev4z.onrender.com",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [react()],
});
