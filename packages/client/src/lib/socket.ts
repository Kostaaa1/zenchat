import io from "socket.io-client"
const { MODE, VITE_SERVER_URL, VITE_DEV_SERVER } = import.meta.env
export const serverURL = MODE === "development" ? VITE_DEV_SERVER : VITE_SERVER_URL
export const socket = io(serverURL)
