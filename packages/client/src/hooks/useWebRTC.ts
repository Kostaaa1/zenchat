import { useCallback, useEffect, useState } from "react";
import usePeerConnection from "../stores/peerConnection";
import {
  RTCAnswerResponse,
  RTCIceCandidateResponse,
  RTCOfferResponse,
  SocketCallPayload,
} from "../../../server/src/types/sockets";
import useUser from "./useUser";
import { socket } from "../lib/socket";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

const useWebRTC = () => {
  // const [isConnected, setIsConnected] = useState<boolean>(false);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const { clearAll, setIsCalling } = usePeerConnection(
    (state) => state.actions,
  );
  const { userData } = useUser();

  const createPeerConnection = useCallback(
    (receivers: string[]) => {
      const conn = new RTCPeerConnection({ iceServers });
      conn.onicecandidate = (ev) => {
        if (ev.candidate) {
          console.log("Received candidate should send via socket", ev);
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
      return conn;
    },
    [userData],
  );

  const startCall = useCallback(
    async (data: { chatroomId: string; receivers: string[] }) => {
      console.log("Starting CALL");
      if (!userData) return;
      const { receivers, chatroomId } = data;
      const { id, image_url, username } = userData;
      const payload: SocketCallPayload = {
        chatroomId,
        status: "initiated",
        receivers,
        caller: {
          id,
          image_url,
          username,
        },
      };
      socket.emit("call", payload);
      setIsCalling(true);
    },
    [userData, setIsCalling],
  );

  const createOfferAndListenICE = async (
    receivers: string[],
    chatroomId: string,
  ) => {
    try {
      if (!userData) return;
      console.log("CALLEE PICKED, CREATING OFFER MAYBE ?  ?? ? ?  !!!");
      const peerConnection = createPeerConnection(receivers);
      setPeerConnection(peerConnection);
      ////////////////////////
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));
      const audioElement = document.getElementById("local");
      if (audioElement) {
        const el = audioElement as HTMLAudioElement;
        el.srcObject = localStream;
      }
      ////////////////////////
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peerConnection.setLocalDescription(offer);

      socket.emit("offer", {
        chatroomId,
        offer,
        caller: userData?.id,
        receivers,
      });
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  const receiveAnswer = useCallback(
    async (data: RTCAnswerResponse) => {
      const { status } = data;
      if (status === "success") {
        const remoteDesc = new RTCSessionDescription(data.message.answer);
        await peerConnection?.setRemoteDescription(remoteDesc);
      }
    },
    [peerConnection],
  );

  const receieveIceCandidate = useCallback(
    async (data: RTCIceCandidateResponse) => {
      const { status, message } = data;
      if (status === "success" && peerConnection) {
        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(message.candidate),
          );
        } catch (error) {
          console.log("Error when adding the ICE candidate", error);
        }
      }
    },
    [peerConnection],
  );

  const receiveOfferAndListenICE = useCallback(
    async (res: RTCOfferResponse) => {
      if (!userData) return;
      if (res.status === "success") {
        const { message } = res;
        const { offer, caller, chatroomId, receivers } = message;
        const conn = createPeerConnection(receivers);
        setPeerConnection(conn);
        //////////////////////
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        localStream
          .getTracks()
          .forEach((track) => conn.addTrack(track, localStream));
        const audioElement = document.getElementById("local");
        if (audioElement) {
          const el = audioElement as HTMLAudioElement;
          el.srcObject = localStream;
        }
        //////////////////////
        conn.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await conn.createAnswer();
        await conn.setLocalDescription(answer);
        const data: RTCAnswerResponse["message"] = {
          answer,
          caller,
          chatroomId,
          receivers,
        };
        console.log("ANSWER SENDING: ", data);
        socket.emit("answer", data);
      } else {
        console.log("Error: ", res.message);
      }
    },
    [userData],
  );

  const cleanUp = useCallback(() => {
    console.log("RTCVOICELCALL CLEANUP RAN");
    if (!userData) return;

    socket.off("ice", receieveIceCandidate);
    socket.off("offer", receiveOfferAndListenICE);
    socket.off("answer", receiveAnswer);

    if (peerConnection) {
      peerConnection.onicecandidate = null;
      peerConnection.ontrack = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.close();
      setPeerConnection(null);
    }
    clearAll();
  }, [
    userData,
    peerConnection,
    clearAll,
    receieveIceCandidate,
    receiveAnswer,
    receiveOfferAndListenICE,
  ]);

  useEffect(() => {
    socket.on("ice", receieveIceCandidate);
    socket.on("offer", receiveOfferAndListenICE);
    socket.on("answer", receiveAnswer);

    return () => {
      cleanUp();
    };
  }, [receieveIceCandidate, receiveOfferAndListenICE, receiveAnswer, cleanUp]);

  return {
    peerConnection,
    createOfferAndListenICE,
    receiveOfferAndListenICE,
    receiveAnswer,
    receieveIceCandidate,
    startCall,
    cleanUp,
  };
};
export default useWebRTC;