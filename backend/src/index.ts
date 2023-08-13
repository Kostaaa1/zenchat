const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
import supabase from "./db/supabase";

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your React app's URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: any) => {
  socket.on("joinRoom", async (room: any) => {
    try {
      socket.join(room);

      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("room", room);

      io.to(room).emit("messages", messages);
    } catch (error) {
      console.error("Error occured while joining the room", error);
    }
  });

  socket.on("chatMessage", async (data: any) => {
    try {
      console.log("chat messages run", data);
      const { room, message, user_id } = data;

      const { error: insertError } = await insertMessage(
        room,
        message,
        user_id
      );

      if (!insertError) {
        const newMessage = await fetchLatestMessage(room);
        console.log("newMessage: ", newMessage);

        if (newMessage) {
          io.to(room).emit("message", newMessage);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
      socket.emit("chatError", "An error occurred while sending the message.");
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

async function fetchLatestMessage(room: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .match({ room })
    .limit(1);
  if (error) {
    throw error;
  }
  return data[0];
}

async function insertMessage(room: string, message: string, user_id: string) {
  return await supabase.from("messages").insert({ room, message, user_id });
}

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
