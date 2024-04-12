import { Server, Socket } from "socket.io";
import supabase from "./supabase";

interface TCustomSocketType extends Socket {
  userId?: string;
}

export const initSocket = (io: Server) => {
  io.on("connection", (socket: TCustomSocketType) => {
    const rooms = io.sockets.adapter.rooms;
    socket.on("join-room", async (userId: string) => {
      if (!userId || rooms.has(socket.id)) return;
      console.log("Joined room: ", userId);
      socket.join(userId);
    });

    socket.on("typing", (data: { username: string; chatroom_id: string }) => {
      console.log(data);
      io.emit("join-room", { channel: "typing", data });
    });

    socket.on("messages-channel", () => {
      try {
        supabase
          .channel("messages-channel")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "messages" },
            async (payload) => {
              const messageData = payload.new;
              io.emit("join-room", {
                channel: "messages-channel",
                data: messageData,
              });
            }
          )
          .subscribe();
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
