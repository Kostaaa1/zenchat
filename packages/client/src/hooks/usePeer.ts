import { useParams } from "react-router-dom"
import useUser from "./useUser"
import usePeerConnectionStore from "../stores/peerConnection"
import Peer from "peerjs"
import { useCallback, useEffect, useState } from "react"
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

  const videoCleanUp = useCallback((className: string) => {
    const video = document.querySelector(className) as HTMLVideoElement
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      video.srcObject = null
    }
  }, [])

  const cleanup = useCallback(() => {
    videoCleanUp(".local-video")
    videoCleanUp(".remote-video")
    peerConnection?.off("call")
    peerConnection?.off("close")
    peerConnection?.destroy()
    peerConnection?.disconnect()
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

  useEffect(() => {
    if (!user) return
    const conn = new Peer(user.id, { config: { iceServers } })
    setPeerConnection(conn)

    conn.on("open", () => {
      conn.on("call", async (call) => {
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        const video = document.querySelector(".local-video") as HTMLVideoElement
        if (video) {
          video.srcObject = localStream
          video.muted = true
          video.autoplay = true
        }
        call.answer(localStream)
        call.on("stream", (callStream) => {
          const video = document.querySelector(".remote-video") as HTMLVideoElement
          video.srcObject = callStream
        })
        call.on("close", () => {
          console.log("Call closed 1")
          cleanup()
        })
      })
    })
    conn.on("close", () => {
      cleanup()
    })
    return () => {
      conn.off("open")
      conn.off("call")
      conn.off("close")
      conn.disconnect()
      conn.destroy()
    }
  }, [user])

  useEffect(() => {
    const call = async () => {
      if (!isCallAccepted || !callInfo || !user || !peerConnection) return
      const { participants } = callInfo
      const callee = participants.find((x) => x !== user.id)
      peerConnection.on("call", () => {
        setIsVideo(true)
      })

      if (callee) {
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        const video = document.querySelector(".local-video") as HTMLVideoElement
        if (video) {
          video.srcObject = localStream
          video.muted = true
          video.autoplay = true
        }
        const conn = peerConnection.call(callee, localStream)
        conn.on("stream", (stream) => {
          const video = document.querySelector(".remote-video") as HTMLVideoElement
          video.srcObject = stream
        })
      }
    }
    call()
  }, [peerConnection, isCallAccepted, callInfo, user])

  const startCall = useCallback(
    (data: { chatroomId: string; participants: string[] }) => {
      const { participants, chatroomId } = data
      if (!user) return
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
