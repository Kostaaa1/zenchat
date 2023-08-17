const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
import supabase from "./db/supabase";

export interface IUserData {
  username: string;
  imageUrl: string;
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your React app's URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: any) => {
  socket.on("users", async (input: any) => {
    try {
      socket.join(input);
      console.log(input);
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .ilike("username", `%${input}%`);

      if (error) {
        console.error("Supabase query error:", error.message);
        return;
      }
      console.log("Fetched users", users);

      io.to(input).emit("users", users);
    } catch (error) {
      console.error("Error occured while joining the room", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
