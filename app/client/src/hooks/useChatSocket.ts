import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { TRecieveNewSocketMessageType } from "../../../server/src/types/sockets";

type TUseChatSocketProps = {
  socket: Socket;
  userId: string;
  recieveNewSocketMessage: (data: TRecieveNewSocketMessageType) => void;
};

const useChatSocket = ({
  socket,
  userId,
  recieveNewSocketMessage,
}: TUseChatSocketProps) => {
  useEffect(() => {
    if (!userId) return;

    socket.emit("join-room", userId);
    socket.on("join-room", recieveNewSocketMessage);

    socket.emit("messages-channel", userId);
    socket.on("messages-channel", recieveNewSocketMessage);

    socket.on("typing", recieveNewSocketMessage);

    const cleanup = () => {
      socket.off("join-room", recieveNewSocketMessage);
      socket.off("messages-channel", recieveNewSocketMessage);
      socket.off("typing", recieveNewSocketMessage);

      socket.off("disconnect", () => {
        console.log("Disconnected from socket");
      });
    };

    return cleanup;
  }, [userId]);
};

export default useChatSocket;
