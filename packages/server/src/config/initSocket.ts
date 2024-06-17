import { Server, Socket } from "socket.io";
import supabase from "./supabase";
import { TMessage } from "../types/types";
import { getChatroomUsersFromID } from "../utils/supabase/chatroom";
import { SocketCallPayload, RTCIceCandidateResponse, RTCOfferResponse } from "../types/sockets";

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

    socket.on("offer", async (data: RTCOfferResponse["message"]) => {
      console.log("OFFER INITIATEDJ", data);
      const { receivers } = data;
      for (const user of receivers) {
        if (user !== data.caller) {
          io.to(user).emit("offer", {
            status: "success",
            message: data,
          });
        }
      }
    });

    socket.on("answer", (data: RTCOfferResponse["message"]) => {
      console.log("RECEIEVED ANSWER");
      io.to(data.caller).emit("answer", { status: "success", message: data });
    });

    socket.on("ice", (data: RTCIceCandidateResponse["message"]) => {
      const { receivers } = data;
      for (const receiver of receivers) {
        if (receiver !== data.caller) {
          io.to(receiver).emit("ice", { status: "success", message: data });
        }
      }
    });

    socket.on("call", (payload: SocketCallPayload) => {
      const { caller, receivers, status } = payload;
      if (status === "initiated") {
        for (const receiver of receivers) {
          if (receiver !== caller.id) {
            io.to(receiver).emit("call", payload);
          }
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
