import { Server, Socket } from "socket.io";
import supabase from "./supabase";
import { TMessage } from "../types/types";

interface TCustomSocketType extends Socket {
  userId?: string;
}

export const initSocket = (io: Server) => {
  io.on("connection", (socket: TCustomSocketType) => {
    socket.on("join-room", async (userId: string) => {
      if (!userId) return;

      console.log("Joined room: ", userId);
      socket.join(userId);
    });

    socket.on("new-message", (messageData: TMessage) => {
      io.emit("join-room", messageData);
    });

    socket.on("messages-channel", () => {
      try {
        supabase
          .channel("messages-channel")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "messages" },
            async (payload) => {
              const messageData = payload.new as TMessage;

              // if (messageData.isImage) return;
              io.emit("join-room", messageData);
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
