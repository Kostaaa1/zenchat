import { Server, Socket } from "socket.io";
import supabase from "./supabase";
import { TMessage } from "../types/types";
import { getChatroomUsersFromID } from "../utils/supabase/chatroom";
import { SocketCallPayload } from "../types/sockets";

interface TCustomSocketType extends Socket {
  userId?: string;
}
export let rooms: Map<string, Set<string>>;

export const initSocket = (io: Server) => {
  io.on("connection", (socket: TCustomSocketType) => {
    rooms = io.sockets.adapter.rooms;
    socket.on("join-room", async (userId: string) => {
      if (!userId || rooms.has(userId)) return;
      socket.join(userId);
      socket.leave(socket.id);
      console.log("Joined room: ", userId, "Rooms", rooms);
    });

    socket.on("call", (payload: SocketCallPayload) => {
      const { caller, participants, type } = payload;
      if (type === "initiated") {
        for (const receiver of participants) {
          if (receiver !== caller.id) {
            io.to(receiver).emit("call", payload);
          }
        }
      } else if (type === "hangup") {
        for (const receiver of participants) {
          io.to(receiver).emit("call", payload);
        }
      } else {
        io.to(caller.id).emit("call", payload);
      }
    });

    socket.on("onMessage", () => {
      try {
        supabase
          .channel("onMessage")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "messages" },
            async (payload) => {
              const messageData = payload.new as TMessage;
              const { data, status } = await getChatroomUsersFromID(messageData.chatroom_id);
              if (status === "error" || !data) {
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
