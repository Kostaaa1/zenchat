// import { useCallback, useEffect, useState } from "react"
// import usePeerConnection from "../stores/peerConnection"
// import useUser from "./useUser"
// import { socket } from "../lib/socket"
// import { RTCSignals, SocketCallPayload } from "../../../server/src/types/sockets"
// import { playSound } from "../utils/file"
// import ringingSoundPath from "../../public/ringing.mp3"

// const iceServers = [
//   { urls: "stun:stun.l.google.com:19302" },
//   { urls: "stun:stun.l.google.com:5349" },
//   { urls: "stun:stun1.l.google.com:3478" },
//   { urls: "stun:stun1.l.google.com:5349" },
//   { urls: "stun:stun2.l.google.com:19302" },
//   { urls: "stun:stun2.l.google.com:5349" },
//   { urls: "stun:stun3.l.google.com:3478" },
//   { urls: "stun:stun3.l.google.com:5349" },
//   { urls: "stun:stun4.l.google.com:19302" },
//   { urls: "stun:stun4.l.google.com:5349" }
// ]

// const useWebRTC = () => {
//   const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
//   const { clearAll, setIsCalling } = usePeerConnection((state) => state.actions)
//   const { user } = useUser()
//   const createPeerConnection = useCallback(
//     (receivers: string[], chatroomId: string) => {
//       const conn = new RTCPeerConnection({ iceServers })
//       conn.onicecandidate = (ev) => {
//         if (ev.candidate) {
//           socket.emit("rtc", {
//             type: "ice",
//             caller: user?.id,
//             candidate: ev.candidate,
//             chatroomId,
//             receivers
//           })
//         }
//       }
//       conn.ontrack = (event) => {
//         const video = document.querySelector(".remote-video") as HTMLVideoElement
//         if (video) video.srcObject = event.streams[0]
//       }
//       return conn
//     },
//     [user]
//   )

//   const startCall = useCallback(
//     async (data: { chatroomId: string; receivers: string[] }) => {
//       if (!user) return
//       const { receivers, chatroomId } = data
//       const { id, image_url, username } = user
//       playSound("source1", ringingSoundPath)
//       socket.emit("call", {
//         chatroomId,
//         type: "initiated",
//         receivers,
//         caller: {
//           id,
//           image_url,
//           username
//         }
//       } as SocketCallPayload)
//       setIsCalling(true)
//     },
//     [user, setIsCalling]
//   )

//   const createOfferAndListenICE = useCallback(
//     async (receivers: string[], chatroomId: string) => {
//       try {
//         if (!user || peerConnection) return
//         const conn = createPeerConnection(receivers, chatroomId)
//         setPeerConnection(conn)
//         ///////////////////////
//         const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
//         localStream.getTracks().forEach((track) => conn.addTrack(track, localStream))
//         const video = document.querySelector(".local-video") as HTMLVideoElement
//         if (video) {
//           video.srcObject = localStream
//           video.muted = true
//           video.autoplay = true
//         }
//         ///////////////////////
//         const offer = await conn.createOffer({
//           offerToReceiveAudio: true,
//           offerToReceiveVideo: true
//         })
//         await conn.setLocalDescription(offer)
//         socket.emit("rtc", {
//           type: "offer",
//           chatroomId,
//           offer,
//           caller: user?.id,
//           receivers
//         })
//       } catch (error) {
//         console.log("ERROR: ", error)
//       }
//     },
//     [user, peerConnection]
//   )

//   const receiveRTCSignal = useCallback(
//     async (payload: RTCSignals) => {
//       const { type } = payload
//       if (type === "offer") {
//         if (peerConnection) return

//         const { offer, caller, chatroomId, receivers } = payload
//         const conn = createPeerConnection(receivers, chatroomId)
//         setPeerConnection(conn)
//         //////////////////////
//         const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
//         localStream.getTracks().forEach((track) => conn.addTrack(track, localStream))
//         const video = document.querySelector(".local-video") as HTMLVideoElement
//         if (video) {
//           video.srcObject = localStream
//           video.autoplay = true
//           video.muted = true
//         }
//         //////////////////////
//         await conn.setRemoteDescription(new RTCSessionDescription(offer))
//         const answer = await conn.createAnswer()
//         await conn.setLocalDescription(answer)
//         socket.emit("rtc", {
//           type: "answer",
//           answer,
//           caller,
//           chatroomId,
//           receivers
//         } as RTCSignals)
//       }
//       if (type === "answer" && peerConnection) {
//         if (peerConnection.signalingState !== "stable") {
//           const remoteDesc = new RTCSessionDescription(payload.answer)
//           await peerConnection?.setRemoteDescription(remoteDesc)
//         }
//       }
//       if (type === "ice" && peerConnection) {
//         await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate))
//         // const desc = peerConnection.remoteDescription
//         // if (desc && desc.type) {
//         // }
//       }
//     },
//     [peerConnection]
//   )
//   const cleanUp = useCallback(() => {
//     console.log("cleanup ran")
//     socket.off("rtc", receiveRTCSignal)
//     if (peerConnection) {
//       peerConnection.onicecandidate = null
//       peerConnection.ontrack = null
//       peerConnection.oniceconnectionstatechange = null
//       peerConnection.close()
//       setPeerConnection(null)
//     }
//     clearAll()
//   }, [peerConnection, clearAll, receiveRTCSignal])
//   useEffect(() => {
//     socket.on("rtc", receiveRTCSignal)
//   }, [receiveRTCSignal])
//   return {
//     peerConnection,
//     createOfferAndListenICE,
//     startCall,
//     cleanUp
//   }
// }

// export default useWebRTC
