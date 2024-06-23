import { Server, Socket } from "socket.io";
import supabase from "./supabase";
import { TMessage, SocketCallPayload } from "../types/types";
import { getChatroomUsersFromID } from "../utils/supabase/chatroom";

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
      const { initiator, participants, type } = payload;
      if (type === "initiated") {
        for (const receiver of participants) {
          if (receiver !== initiator.id) {
            io.to(receiver).emit("call", payload);
          }
        }
      } else if (type === "hangup") {
        for (const receiver of participants) {
          io.to(receiver).emit("call", payload);
        }
      } else if (type === "mute-remote" || type === "show-remote") {
        console.log("RECEIVED PAYLOADJ", payload);
        for (const receiver of participants) {
          if (receiver !== initiator.id) {
            io.to(receiver).emit("call", payload);
          }
        }
      } else {
        io.to(initiator.id).emit("call", payload);
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
