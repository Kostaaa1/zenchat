import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import process from "process"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const API_URL = `${mode === "production" ? env.VITE_SERVER_URL : env.VITE_DEV_SERVER}`

  return {
    server: {
      // proxy: {
      //   "/api": {
      //     target: API_URL,
      //     changeOrigin: true,
      //   },
      //   "/socket.io": {
      //     target: API_URL,
      //     changeOrigin: true,
      //     secure: false,
      //     ws: true,
      //   },
      // },
      proxy: {
        "/api": {
          target: API_URL,
          changeOrigin: true
        },
        "/socket.io": {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },
    plugins: [react()]
  }
})
