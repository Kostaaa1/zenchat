import { useEffect } from "react";
import useUser from "./useUser";
import useChatStore from "../utils/state/chatStore";
import useChatCache from "./useChatCache";
import { socket } from "../lib/socket";

const useChatSocket = () => {
  const { userData } = useUser();
  const { recieveNewSocketMessage } = useChatCache();

  useEffect(() => {
    if (!userData) return;
    socket.emit("join-room", userData.id);
    socket.emit("onMessage", userData.id);
    socket.on("onMessage", recieveNewSocketMessage);

    const cleanup = () => {
      socket.off("join-room", recieveNewSocketMessage);
      socket.off("onMessage", recieveNewSocketMessage);
      socket.off("disconnect", () => {
        console.log("Disconnected from socket");
      });
    };

    return cleanup;
  }, [userData]);
};

export default useChatSocket;
