const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
import supabase from "./db/supabase";

export interface IUserData {
  username: string;
  image_url: string;
}

interface TMessage {
  sender_id: string;
  chatroom_id: string;
  content: string;
  created_at: string;
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: any) => {
  socket.on("join-room", (chatroomId: string) => {
    console.log("Joined room", chatroomId);
    socket.join(chatroomId);
  });

  socket.on("new-message", async (messageData: TMessage) => {
    const { chatroom_id, content, sender_id, created_at } = messageData;
    io.to(chatroom_id).emit("new-message", messageData);
    try {
      const { data, error: newMessageError } = await supabase
        .from("messages")
        .insert(messageData)
        .select("created_at");

      console.log(data?.[0]?.created_at);
      const { error: lastMessageUpdateError } = await supabase
        .from("chatrooms")
        .update({
          last_message: content,
          created_at,
        })
        .eq("id", chatroom_id);

      if (newMessageError) {
        io.emit("Error occurred: ", newMessageError);
      }

      if (lastMessageUpdateError) {
        io.emit("Error occurred: ", lastMessageUpdateError);
      }
    } catch (error) {
      console.log(error);
      io.emit("Error occurred", "An error occured in new-message socket");
    }
  });


  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
