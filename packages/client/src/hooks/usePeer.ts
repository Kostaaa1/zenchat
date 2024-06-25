import { useParams } from "react-router-dom"
import useUser from "./useUser"
import usePeerConnectionStore from "../stores/peerConnection"
import Peer from "peerjs"
import { createRef, useCallback, useEffect, useRef, useState } from "react"
import { trpc } from "../lib/trpcClient"
import { socket } from "../lib/socket"
import { playSound } from "../utils/file"
import ringingPath from "../../public/ringing.mp3"
import { CallParticipant, SocketCallPayload } from "../../../server/src/types/types"

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
  const {
    setIsCalling,
    clearAll,
    addRemoteVideo,
    removeRemoteVideo,
    setCallInfo,
    setIsCallAccepted,
    setRemoteVideos,
    toggleDisplayVideo,
    toggleMuteVideo
  } = usePeerConnectionStore((state) => state.actions)
  const { remoteVideos, isCalling, isCallAccepted, callInfo } = usePeerConnectionStore((state) => ({
    isCalling: state.isCalling,
    isCallAccepted: state.isCallAccepted,
    callInfo: state.callInfo,
    remoteVideos: state.remoteVideos
  }))
  const [peerConnection, setPeerConnection] = useState<Peer | null>(null)
  const { data: chatroomUsers } = trpc.chat.get.chatroom_users.useQuery(chatroomId!, {
    enabled: !!chatroomId,
    refetchOnMount: true
  })

  useEffect(() => {
    console.log("remoteVideos", remoteVideos)
  }, [remoteVideos])

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
  }, [peerConnection, clearAll])

  const hangup = useCallback(() => {
    if (!peerConnection || !user || !chatroomUsers || !callInfo) return
    if (peerConnection) {
      socket.emit("call", {
        type: "hangup",
        participants: activateParticipant(callInfo.participants, user!.id)
      })
      cleanup()
    }
  }, [chatroomUsers, callInfo, cleanup, peerConnection, user])

  const createRemoteVideo = (id: string, srcObject: MediaStream) => {
    const vid = document.getElementById(id) as HTMLVideoElement
    const addProps = (video: HTMLVideoElement) => {
      video.classList.add("remote-video")
      video.setAttribute("id", id)
      video.srcObject = srcObject
      video.muted = false
      video.autoplay = true
    }

    if (!vid) {
      const parent = document.getElementById("video-calls")
      if (parent) {
        const newVid = document.createElement("video") as HTMLVideoElement
        addProps(newVid)
        addRemoteVideo({ id, isVideoDisplayed: true, isVideoMuted: false })
        parent.appendChild(newVid)
      }
    } else {
      vid.srcObject = srcObject
    }
  }

  useEffect(() => {
    if (remoteVideos.length > 0) {
      remoteVideos.forEach((video) => {
        console.log("Video : ", video)
        const vid = document.getElementById(video.id) as HTMLVideoElement
        if (vid) {
          vid.style.display = video.isVideoDisplayed ? "" : "none"
          vid.muted = video.isVideoMuted
        }
      })
    }
  }, [remoteVideos])

  useEffect(() => {
    if (!isCallAccepted || !callInfo || !user) return
    const { participants } = callInfo
    const peer = new Peer(user.id, { config: { iceServers } })
    setPeerConnection(peer)

    peer.on("open", async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      const video = document.querySelector(".local-video") as HTMLVideoElement
      if (video) {
        video.srcObject = localStream
        video.muted = true
        video.autoplay = true
      }
      participants.forEach((participant) => {
        if (participant.is_caller) {
          if (participant.id !== user.id) {
            const conn = peer.call(participant.id, localStream)
            conn.on("stream", (stream) => {
              createRemoteVideo(participant.id, stream)
            })
          }
        } else {
          peer.on("call", async (call) => {
            call.answer(localStream)
            call.on("stream", (callStream) => {
              if (participant.id !== user.id) {
                createRemoteVideo(participant.id, callStream)
              }
            })
          })
        }
      })
    })
  }, [callInfo, user, isCallAccepted])

  const activateParticipant = (participants: CallParticipant[], id: string) => {
    return participants.map((participant) =>
      participant.id === id ? { ...participant, is_caller: true } : { ...participant, is_caller: false }
    )
  }

  const startCall = useCallback(
    (data: SocketCallPayload) => {
      if (!user) return
      playSound("source1", ringingPath)
      setIsCalling(true)
      socket.emit("call", data as SocketCallPayload)
    },
    [user]
  )

  return {
    startCall,
    hangup,
    cleanup,
    isCalling,
    isCallAccepted,
    callInfo,
    activateParticipant,
    peerConnection,
    remoteVideos
  }
}

export default usePeer
