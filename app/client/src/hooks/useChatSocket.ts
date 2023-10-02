import { useEffect } from "react";
import { TMessage } from "../../../server/src/types/types";
import { Socket } from "socket.io-client";

type TUseChatSocketProps = {
  socket: Socket;
  userId: string;
  recieveNewSocketMessage: (messageData: TMessage) => void;
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

    socket.on("new-message", recieveNewSocketMessage);

    const cleanup = () => {
      socket.off("join-room", recieveNewSocketMessage);
      socket.off("messages-channel", recieveNewSocketMessage);
      socket.off("new-message", recieveNewSocketMessage);

      socket.off("disconnect", () => {
        console.log("Disconnected from socket");
      });
    };

    return cleanup;
  }, [userId]);
};

export default useChatSocket;
