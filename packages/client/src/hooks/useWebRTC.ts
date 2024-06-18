import { useCallback, useEffect, useState } from "react"
import usePeerConnection from "../stores/peerConnection"
import useUser from "./useUser"
import { socket } from "../lib/socket"
import {
  RTCAnswerResponse,
  RTCIceCandidateResponse,
  RTCOfferResponse,
  SocketCallPayload
} from "../../../server/src/types/sockets"

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.l.google.com:5349" },
  { urls: "stun:stun1.l.google.com:3478" },
  { urls: "stun:stun1.l.google.com:5349" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:5349" },
  { urls: "stun:stun3.l.google.com:3478" },
  { urls: "stun:stun3.l.google.com:5349" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:5349" }
]

const mediaConstraints = {
  audio: { echoCancellation: true },
  video: true
}

const useWebRTC = () => {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const { clearAll, setIsCalling } = usePeerConnection((state) => state.actions)
  const { userData } = useUser()

  const createVideo = (id: "local" | "remote", srcObject: MediaStream) => {
    const parent = document.getElementById("video-calls")
    const remoteVideo = document.getElementById("remote")
    if (parent && !remoteVideo) {
      console.log("Creating video: ", id)

      const video = document.createElement("video")
      if (id === "remote") {
        video.classList.add("remote-video")
      } else {
        video.classList.add("local-video")
      }
      video.setAttribute("id", id)

      video.muted = true
      video.autoplay = true
      video.srcObject = srcObject
      parent.appendChild(video)
    }
  }

  const createPeerConnection = useCallback(
    (receivers: string[]) => {
      const conn = new RTCPeerConnection({ iceServers })
      conn.onicecandidate = (ev) => {
        if (ev.candidate) {
          socket.emit("ice", {
            caller: userData?.id,
            candidate: ev.candidate,
            receivers
          })
        }
      }
      conn.ontrack = (event) => {
        createVideo("remote", event.streams[0])
      }
      return conn
    },
    [userData]
  )

  const startCall = useCallback(
    async (data: { chatroomId: string; receivers: string[] }) => {
      console.log("Starting CALL")
      if (!userData) return
      const { receivers, chatroomId } = data
      const { id, image_url, username } = userData
      const payload: SocketCallPayload = {
        chatroomId,
        status: "initiated",
        receivers,
        caller: {
          id,
          image_url,
          username
        }
      }
      socket.emit("call", payload)
      setIsCalling(true)
    },
    [userData, setIsCalling]
  )

  const createOfferAndListenICE = useCallback(
    async (receivers: string[], chatroomId: string) => {
      try {
        if (!userData) return
        console.log("Creating connection, then offer, and sending it to chatroom participants")
        const conn = createPeerConnection(receivers)
        setPeerConnection(conn)
        ///////////////////////
        const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
        localStream.getTracks().forEach((track) => conn.addTrack(track, localStream))
        createVideo("local", localStream)
        ///////////////////////
        const offer = await conn.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        })
        await conn.setLocalDescription(offer)
        socket.emit("offer", {
          chatroomId,
          offer,
          caller: userData?.id,
          receivers
        })
      } catch (error) {
        console.log("ERROR: ", error)
      }
    },
    [createPeerConnection, userData]
  )

  const receiveAnswer = useCallback(
    async (data: RTCAnswerResponse) => {
      const { status } = data
      if (status === "success") {
        const remoteDesc = new RTCSessionDescription(data.message.answer)
        await peerConnection?.setRemoteDescription(remoteDesc)
      }
    },
    [peerConnection]
  )

  const receieveIceCandidate = useCallback(
    async (data: RTCIceCandidateResponse) => {
      const { status, message } = data
      if (status === "success" && peerConnection) {
        const desc = peerConnection.remoteDescription
        if (desc && desc.type) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
        }
      }
    },
    [peerConnection]
  )

  const receiveOfferAndListenICE = useCallback(
    async (res: RTCOfferResponse) => {
      console.log("received offer, now need to create new connection and send the answer to caller", res)
      if (res.status === "success") {
        const { message } = res
        const { offer, caller, chatroomId, receivers } = message
        const conn = createPeerConnection(receivers)
        setPeerConnection(conn)
        //////////////////////
        const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
        localStream.getTracks().forEach((track) => conn.addTrack(track, localStream))
        createVideo("local", localStream)
        //////////////////////
        await conn.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await conn.createAnswer()
        await conn.setLocalDescription(answer)
        const data: RTCAnswerResponse["message"] = {
          answer,
          caller,
          chatroomId,
          receivers
        }
        socket.emit("answer", data)
      } else {
        console.log("Error: ", res.message)
      }
    },
    [createPeerConnection]
  )

  const cleanUp = useCallback(() => {
    socket.off("ice", receieveIceCandidate)
    socket.off("offer", receiveOfferAndListenICE)
    socket.off("answer", receiveAnswer)
    if (peerConnection) {
      peerConnection.onicecandidate = null
      peerConnection.ontrack = null
      peerConnection.oniceconnectionstatechange = null
      peerConnection.close()
      setPeerConnection(null)
    }
    clearAll()
  }, [peerConnection, clearAll, receieveIceCandidate, receiveAnswer, receiveOfferAndListenICE])

  useEffect(() => {
    socket.on("ice", receieveIceCandidate)
    socket.on("offer", receiveOfferAndListenICE)
    socket.on("answer", receiveAnswer)
    return () => {
      cleanUp()
    }
  }, [receieveIceCandidate, receiveOfferAndListenICE, receiveAnswer, cleanUp])

  return {
    peerConnection,
    createOfferAndListenICE,
    receiveOfferAndListenICE,
    receiveAnswer,
    receieveIceCandidate,
    startCall,
    cleanUp
  }
}
export default useWebRTC
