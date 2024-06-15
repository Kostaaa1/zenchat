import { useCallback, useEffect } from "react";
import useUser from "./useUser";
import useChatStore from "../stores/chatStore";
import { socket } from "../lib/socket";
import {
  RTCAnswerResponse,
  RTCIceCandidateResponse,
  RTCOfferResponse,
  TMessage,
} from "../../../server/src/types/types";
import { trpc } from "../lib/trpcClient";
import { getCurrentDate } from "../utils/date";
import { TReceiveNewSocketMessageType } from "../../../server/src/types/sockets";
import { loadImage } from "../utils/image";
import { toast } from "react-toastify";
import usePeerConnection from "../stores/peerConnection";

const useChatSocket = () => {
  const utils = trpc.useUtils();
  const activeChatroom = useChatStore((state) => state.activeChatroom);
  const { userData } = useUser();
  const peerConnection = usePeerConnection((state) => state.peerConnection);
  const { setPeerConnection } = usePeerConnection((state) => state.actions);

  const addNewMessageToChatCache = useCallback(
    (messageData: TMessage) => {
      utils.chat.messages.get.setData(
        {
          chatroom_id: messageData.chatroom_id,
        },
        (staleChats) => {
          if (staleChats && messageData) {
            return [messageData, ...staleChats];
          }
        },
      );
    },
    [utils.chat.messages.get],
  );

  const replacePreviewImage = useCallback(
    (messageData: TMessage) => {
      utils.chat.messages.get.setData(
        {
          chatroom_id: messageData.chatroom_id,
        },
        (staleChats) => {
          if (messageData && staleChats) {
            return staleChats?.map((x) =>
              x.is_image && x.id === messageData.id ? messageData : x,
            );
          }
        },
      );
    },
    [utils.chat.messages.get],
  );

  const updateUserChatLastMessageCache = useCallback(
    (msg: TMessage) => {
      if (!userData) return;
      const { content, chatroom_id } = msg;

      utils.chat.get.user_chatrooms.setData(userData?.id, (state) => {
        const data = state
          ?.map((chat) =>
            chat.chatroom_id === chatroom_id
              ? {
                  ...chat,
                  last_message: content,
                  created_at: getCurrentDate(),
                  users:
                    activeChatroom?.chatroom_id === chat.chatroom_id
                      ? chat.users
                      : chat.users.map((participant) => {
                          return participant.user_id === userData?.id
                            ? { ...participant, is_message_seen: false }
                            : participant;
                        }),
                }
              : chat,
          )
          .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
          });

        return data;
      });
    },
    [utils.chat.get.user_chatrooms, userData, activeChatroom],
  );

  const receiveNewSocketMessage = useCallback(
    async (socketData: TReceiveNewSocketMessageType) => {
      if (!userData) return;
      console.log("Recieve new socket message called", socketData);
      const { channel, data } = socketData;
      if (channel === "onMessage") {
        const { message, shouldActivate } = data;
        const { is_image, sender_id } = message;
        if (is_image) await loadImage(message.content);

        if (shouldActivate) {
          console.log("The chat is inactive, need to refetch");
          ////////////////////////////////////////////////////
          await utils.chat.get.user_chatrooms.invalidate(userData.id);
          await utils.chat.get.user_chatrooms.refetch(userData.id);
          ////////////////////////////////////////////////////
        }
        updateUserChatLastMessageCache(message);

        const isLoggedUserSender = sender_id === userData?.id;
        if (!isLoggedUserSender) {
          // incrementUnreadMessagesCount();
          if (!activeChatroom && !location.pathname.includes("/inbox")) {
            toast(`${message.sender_username}: ${message.content}`);
          }
        }
        if (!is_image) {
          if (!isLoggedUserSender) addNewMessageToChatCache(message);
        } else {
          isLoggedUserSender
            ? replacePreviewImage(message)
            : addNewMessageToChatCache(message);
        }
      }
    },
    [
      activeChatroom,
      addNewMessageToChatCache,
      replacePreviewImage,
      updateUserChatLastMessageCache,
      userData,
    ],
  );

  const recieveCallOffer = async (res: RTCOfferResponse) => {
    console.log("Offer: ", res);

    if (res.status === "success") {
      const { message } = res;
      const { offer, caller, chatroomId, receivers } = message;
      const conn = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      setPeerConnection(conn);
      //////////////////////
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStream
        .getTracks()
        .forEach((track) => conn.addTrack(track, localStream));
      const audioElement = document.getElementById("local");
      if (audioElement) {
        const el = audioElement as HTMLAudioElement;
        el.srcObject = localStream;
      }
      /////////////////////

      conn.onicecandidate = (ev) => {
        if (ev.candidate) {
          console.log("Callee onicecnadidate event received", ev);
          socket.emit("ice", {
            caller: userData?.id,
            candidate: ev.candidate,
            receivers,
          });
        }
      };

      conn.ontrack = (event) => {
        console.log("received remote track: ", event.streams);
        const remoteAudio = document.getElementById("remote");
        if (remoteAudio) {
          const el = remoteAudio as HTMLAudioElement;
          el.srcObject = event.streams[0];
        }
      };

      if (offer) {
        conn.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await conn.createAnswer();
        await conn.setLocalDescription(answer);
        const data: RTCAnswerResponse["message"] = {
          answer,
          caller,
          chatroomId,
          receivers,
        };
        socket.emit("answer", data);
      }
    } else {
      console.log("Error: ", res.message);
    }
  };

  const recieveAnswer = async (data: RTCAnswerResponse) => {
    console.log("Recieved answer: ", data);
    const { status } = data;
    if (status === "success") {
      const remoteDesc = new RTCSessionDescription(data.message.answer);
      await peerConnection?.setRemoteDescription(remoteDesc);
    }
  };

  const receieveIceCandidate = async (data: RTCIceCandidateResponse) => {
    const { status, message } = data;
    if (status === "success") {
      try {
        console.log("receive ICE message: ", message);
        await peerConnection?.addIceCandidate(
          new RTCIceCandidate(message.candidate),
        );
      } catch (error) {
        console.log("Error when adding the ICE candidate", error);
      }
    }
  };

  useEffect(() => {
    if (!userData) return;
    socket.emit("join-room", userData.id);
    socket.emit("onMessage", userData.id);
    socket.on("onMessage", receiveNewSocketMessage);

    socket.on("offer", recieveCallOffer);
    socket.on("answer", recieveAnswer);
    socket.on("ice", receieveIceCandidate);

    const cleanup = () => {
      socket.off("join-room", receiveNewSocketMessage);

      socket.off("onMessage", receiveNewSocketMessage);
      socket.off("offer", recieveCallOffer);
      socket.off("answer", recieveAnswer);

      socket.off("disconnect", () => {
        console.log("Disconnected from socket");
      });
    };

    return cleanup;
  }, [userData, activeChatroom, receiveNewSocketMessage]);
};

export default useChatSocket;
