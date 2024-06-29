import { Server, Socket } from "socket.io";
import supabase from "./supabase";
import { TMessage, SocketCallPayload, SocketMsgSeenPayload } from "../types/types";
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
      console.log("Call", payload);
      const { participants, type } = payload;
      const caller = participants.find((x) => x.is_caller);
      if (type === "initiated") {
        for (const receiver of participants) {
          console.log("RECEIVER", receiver);
          if (!receiver.is_caller) {
            io.to(receiver.id).emit("call", payload);
          }
        }
      } else if (type === "hangup") {
        for (const receiver of participants) {
          if (!receiver.is_caller) {
            io.to(receiver.id).emit("call", payload);
          }
        }
      } else if (type === "mute-remote" || type === "show-remote") {
        for (const receiver of participants) {
          if (!receiver.is_caller) {
            io.to(receiver.id).emit("call", payload);
          }
        }
      } else {
        if (caller) io.to(caller.id).emit("call", payload);
      }
    });

    socket.on("msgSeen", (payload: SocketMsgSeenPayload) => {
      const { participants, chatroomId } = payload;
      for (const p of participants) {
        io.to(p).emit("msgSeen", chatroomId);
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
              for (const receiver of data) {
                const { is_active, user_id } = receiver;
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
