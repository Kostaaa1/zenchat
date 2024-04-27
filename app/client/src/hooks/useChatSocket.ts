import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { TRecieveNewSocketMessageType } from "../../../server/src/types/sockets";
import useUser from "./useUser";
import useChatStore from "../utils/stores/chatStore";

type TUseChatSocketProps = {
  socket: Socket;
  recieveNewSocketMessage: (data: TRecieveNewSocketMessageType) => void;
};

const useChatSocket = ({
  socket,
  recieveNewSocketMessage,
}: TUseChatSocketProps) => {
  const { userData } = useUser();
  const { setTypingUser } = useChatStore((state) => state.actions);
  useEffect(() => {
    if (!userData) return;

    socket.emit("join-room", userData.id);
    socket.emit("onMessage", userData.id);
    socket.on("onMessage", recieveNewSocketMessage);
    // socket.on("isTyping", (data) => {
    //   if (data) {
    //     if (!data.data.isTyping) setTypingUser(data.data.typingUser);
    //   } else {
    //     setTypingUser("");
    //   }
    // });

    const cleanup = () => {
      socket.off("join-room", recieveNewSocketMessage);
      socket.off("onMessage", recieveNewSocketMessage);
      // socket.off("isTyping", recieveNewSocketMessage);
      socket.off("disconnect", () => {
        console.log("Disconnected from socket");
      });
    };

    return cleanup;
  }, [userData]);
};

export default useChatSocket;
