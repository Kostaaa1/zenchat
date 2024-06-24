import { useParams } from "react-router-dom"
import useUser from "./useUser"
import usePeerConnectionStore from "../stores/peerConnection"
import Peer from "peerjs"
import { useCallback, useEffect, useRef, useState } from "react"
import { trpc } from "../lib/trpcClient"
import { socket } from "../lib/socket"
import { playSound } from "../utils/file"
import ringingPath from "../../public/ringing.mp3"
import { SocketCallPayload } from "../../../server/src/types/types"

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
const usePeer = () => {
  const { user } = useUser()
  const { chatroomId } = useParams<{
    chatroomId: string
  }>()
  const { setIsCalling, clearAll, setIsVideo } = usePeerConnectionStore((state) => state.actions)
  const { isCalling, isVideoMuted, isVideoDisplayed, isCallAccepted, callInfo } = usePeerConnectionStore((state) => ({
    isCalling: state.isCalling,
    isCallAccepted: state.isCallAccepted,
    callInfo: state.callInfo,
    isVideoDisplayed: state.isVideoDisplayed,
    isVideoMuted: state.isVideoMuted
  }))
  const [peerConnection, setPeerConnection] = useState<Peer | null>(null)
  const { data: chatroomUsers } = trpc.chat.get.chatroom_users.useQuery(chatroomId!, {
    enabled: !!chatroomId,
    refetchOnMount: true
  })
  const remoteVideoRefs = useRef<HTMLVideoElement[]>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const videoCleanUp = useCallback((className: string) => {
    const video = document.querySelector(className) as HTMLVideoElement
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      video.srcObject = null
    }
  }, [])

  const videoCleanup = () => {
    const local = document.querySelector(".local-video") as HTMLVideoElement
    if (local && local.srcObject) {
      const stream = local.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      local.srcObject = null
    }
    const remote = document.querySelectorAll(".remote-video")
    if (remote) remote.forEach((el) => el.remove())
  }

  const cleanup = useCallback(() => {
    videoCleanup()
    if (peerConnection) {
      peerConnection.off("call")
      peerConnection.off("close")
      peerConnection.destroy()
      peerConnection.disconnect()
    }
    clearAll()
    setPeerConnection(null)
  }, [peerConnection, clearAll, videoCleanUp])

  const hangup = useCallback(() => {
    if (!peerConnection || !user || !chatroomUsers) return
    const participants = chatroomUsers.map((x) => x.user_id).filter((x) => x !== user.id)
    if (peerConnection) {
      socket.emit("call", { type: "hangup", participants })
      cleanup()
    }
  }, [chatroomUsers, cleanup, peerConnection, user])

  const createRemoteVideo = (srcObject: MediaStream, id: string) => {
    const remoteVideo = document.getElementById(id) as HTMLVideoElement
    const add = (video: HTMLVideoElement) => {
      video.classList.add("remote-video")
      video.setAttribute("id", id)
      video.srcObject = srcObject
      video.muted = false
      video.autoplay = true
    }
    if (!remoteVideo) {
      console.log("No remote video, creating it and appending")
      const parent = document.getElementById("video-calls")
      if (parent) {
        const newVid = document.createElement("video") as HTMLVideoElement
        add(newVid)
        videoRef.current = newVid
        parent.appendChild(newVid)
      }
    } else {
      console.log("there is a remote video, adding srcObject")
      remoteVideo.srcObject = srcObject
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isVideoMuted
      videoRef.current.style.display = isVideoDisplayed ? "" : "none"
    }
  }, [videoRef, isVideoMuted, isVideoDisplayed])

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.muted = isVideoMuted
  //   }
  // }, [videoRef, isVideoMuted])
  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.style.display = isVideoDisplayed ? "" : "none"
  //   }
  // }, [videoRef, isVideoDisplayed])

  useEffect(() => {
    if (!isCallAccepted || !callInfo || !user) return
    const peer = new Peer(user.id, { config: { iceServers } })
    setPeerConnection(peer)
    const { participants, initiator } = callInfo

    peer.on("open", async () => {
      const callee = participants.find((x) => x !== user.id)
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      const video = document.querySelector(".local-video") as HTMLVideoElement
      if (video) {
        video.srcObject = localStream
        video.muted = true
        video.autoplay = true
      }
      if (initiator.id === user.id && callee) {
        const conn = peer.call(callee, localStream)
        conn.on("stream", (stream) => {
          console.log("creating remote video1")
          createRemoteVideo(stream, callee)
          setIsVideo(true)
        })
      } else {
        peer.on("call", async (call) => {
          call.answer(localStream)
          call.on("stream", (callStream) => {
            console.log("creating remote video 2")
            createRemoteVideo(callStream, user.id)
            setIsVideo(true)
          })
          call.on("close", () => {
            console.log("Call closed 1")
            cleanup()
          })
        })
      }
    })
  }, [callInfo, user, isCallAccepted])

  const startCall = useCallback(
    (data: { chatroomId: string; participants: string[] }) => {
      if (!user) return
      const { participants, chatroomId } = data
      const { id, image_url, username } = user
      playSound("source1", ringingPath)
      setIsCalling(true)
      socket.emit("call", {
        type: "initiated",
        chatroomId,
        participants,
        initiator: {
          id,
          image_url,
          username
        }
      } as SocketCallPayload)
    },
    [user]
  )

  return {
    remoteVideoRefs,
    startCall,
    hangup,
    cleanup,
    isCalling,
    isVideoMuted,
    isVideoDisplayed,
    isCallAccepted,
    callInfo,
    peerConnection
  }
}

export default usePeer
