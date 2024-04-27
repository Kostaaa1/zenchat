import { Server, Socket } from "socket.io";
import supabase from "./supabase";
import { TMessage } from "../types/types";

interface TCustomSocketType extends Socket {
  userId?: string;
}

export const initSocket = (io: Server) => {
  io.on("connection", (socket: TCustomSocketType) => {
    const rooms = io.sockets.adapter.rooms;
    socket.on("join-room", async (userId: string) => {
      if (!userId || rooms.has(userId)) return;
      socket.join(userId);
      console.log("Joined room: ", userId, "Rooms", rooms);
    });

    socket.on(
      "isTyping",
      (data: {
        isTyping: boolean;
        users: { id: string; isTyping: boolean; typingUser: string }[];
      }) => {
        for (const user of data.users) {
          if (data.isTyping) {
            io.to(user.id).emit("isTyping", { channel: "isTyping", data: user });
          } else {
            io.to(user.id).emit("isTyping", null);
          }
        }
      }
    );

    socket.on("onMessage", () => {
      try {
        supabase
          .channel("onMessage")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "messages" },
            async (payload) => {
              const messageData = payload.new as TMessage;
              const { data, error } = await supabase
                .from("chatroom_users")
                .select("user_id, is_active")
                .eq("chatroom_id", messageData.chatroom_id);
              // .neq("user_id", messageData.sender_id);

              if (error || !data) {
                supabase.channel("onMessage").unsubscribe();
                return;
              }

              for (const reciever of data) {
                const { is_active, user_id } = reciever;
                io.to(user_id).emit("onMessage", {
                  channel: "onMessage",
                  data: { message: messageData, shouldActivate: !is_active, user_id },
                });
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      supabase.channel("onMessage").unsubscribe();
    });
  });
};
