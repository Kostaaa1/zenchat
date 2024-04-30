import { useEffect } from "react";
import useUser from "./useUser";
import useChatStore from "../utils/stores/chatStore";
import useChatCache from "./useChatCache";
import { socket } from "../lib/socket";

const useChatSocket = () => {
  const { userData } = useUser();
  const { recieveNewSocketMessage } = useChatCache();
  const { setTypingUser } = useChatStore((state) => state.actions);

  useEffect(() => {
    if (!userData) return;
    socket.emit("join-room", userData.id);
    socket.emit("onMessage", userData.id);
    socket.on("onMessage", recieveNewSocketMessage);
    socket.on("isTyping", (data) => {
      if (data) {
        if (!data.data.isTyping) setTypingUser(data.data.typingUser);
      } else {
        setTypingUser("");
      }
    });
    const cleanup = () => {
      socket.off("join-room", recieveNewSocketMessage);
      socket.off("onMessage", recieveNewSocketMessage);
      socket.off("isTyping", recieveNewSocketMessage);
      socket.off("disconnect", () => {
        console.log("Disconnected from socket");
      });
    };

    return cleanup;
  }, [userData]);
};

export default useChatSocket;
