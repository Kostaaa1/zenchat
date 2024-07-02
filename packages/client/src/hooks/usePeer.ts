import { useParams } from "react-router-dom"
import useUser from "./useUser"
import usePeerConnectionStore from "../stores/peerConnection"
import Peer from "peerjs"
import { useCallback, useEffect, useState } from "react"
import { trpc } from "../lib/trpcClient"
import { socket } from "../lib/socket"
import { playSound, stopSound } from "../utils/file"
import ringingPath from "../../public/ringing.mp3"
import hangupSound from "../../public/hangup.mp3"
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
  const { setIsCalling, clearAll, setIsRemoteDisplayed } = usePeerConnectionStore((state) => state.actions)
  const { remoteVideos, isRemoteMuted, isRemoteDisplayed, isCalling, isCallAccepted, callInfo } =
    usePeerConnectionStore((state) => ({
      isCalling: state.isCalling,
      isCallAccepted: state.isCallAccepted,
      callInfo: state.callInfo,
      remoteVideos: state.remoteVideos,
      isRemoteDisplayed: state.isRemoteDisplayed,
      isRemoteMuted: state.isRemoteMuted
    }))
  const [peerConnection, setPeerConnection] = useState<Peer | null>(null)
  const { data: chatroomUsers } = trpc.chat.get.chatroom_users.useQuery(chatroomId!, {
    enabled: !!chatroomId,
    refetchOnMount: true
  })

  const videoCleanup = () => {
    const local = document.querySelector(".local-video") as HTMLVideoElement
    if (local && local.srcObject) {
      const stream = local.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      local.srcObject = null
    }

    const remote = document.querySelector(".remote-video") as HTMLVideoElement
    if (remote) {
      const stream = remote.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      local.srcObject = null
    }
  }

  const cleanup = useCallback(() => {
    if (peerConnection) {
      peerConnection.off("call")
      peerConnection.off("close")
      peerConnection.destroy()
      peerConnection.disconnect()
    }
    clearAll()
    videoCleanup()
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

  // const createRemoteVideo = (id: string, srcObject: MediaStream) => {
  //   const vid = document.getElementById(id) as HTMLVideoElement
  //   const addProps = (video: HTMLVideoElement) => {
  //     video.classList.add("remote-video")
  //     video.setAttribute("id", id)
  //     video.srcObject = srcObject
  //     video.muted = false
  //     video.autoplay = true
  //   }
  //   if (!vid) {
  //     const parent = document.getElementById("video-calls")
  //     if (parent) {
  //       const newVid = document.createElement("video") as HTMLVideoElement
  //       addProps(newVid)
  //       addRemoteVideo({ id, isVideoDisplayed: true, isVideoMuted: false })
  //       parent.appendChild(newVid)
  //     }
  //   } else {
  //     vid.srcObject = srcObject
  //   }
  // }
  // useEffect(() => {
  //   if (remoteVideos.length > 0) {
  //     remoteVideos.forEach((video) => {
  //       const vid = document.getElementById(video.id) as HTMLVideoElement
  //       if (vid) {
  //         vid.style.display = video.isVideoDisplayed ? "" : "none"
  //         vid.muted = video.isVideoMuted
  //       }
  //     })
  //   }
  // }, [remoteVideos])

  const remoteVideoSetup = (srcObject: MediaStream) => {
    const video = document.querySelector(".remote-video") as HTMLVideoElement
    if (video) {
      setIsRemoteDisplayed(true)
      video.srcObject = srcObject
      video.autoplay = true
    }
  }

  useEffect(() => {
    if (!isCallAccepted || !callInfo || !user) return
    const { participants } = callInfo
    const peer = new Peer(user.id, { config: { iceServers } })
    setPeerConnection(peer)

    peer.on("open", async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasVideoInput = devices.some((x) => x.kind === "videoinput")
      const hasAudioInput = devices.some((x) => x.kind === "audioinput")

      const localStream = await navigator.mediaDevices.getUserMedia({ audio: hasAudioInput, video: hasVideoInput })
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
              // createRemoteVideo(participant.id, stream)
              remoteVideoSetup(stream)
            })
          }
        } else {
          peer.on("call", async (call) => {
            call.answer(localStream)
            call.on("stream", (callStream) => {
              if (participant.id !== user.id) {
                // createRemoteVideo(participant.id, callStream)
                remoteVideoSetup(callStream)
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

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isCalling) {
      timeout = setTimeout(() => {
        stopSound("source1")
        playSound({ id: "source1", path: hangupSound, start: 0.4 })
        cleanup()
      }, 20000)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [isCalling])

  const startCall = useCallback(
    (data: SocketCallPayload) => {
      if (!user) return
      playSound({ id: "source1", path: ringingPath, start: 1 })
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
    remoteVideos,
    isRemoteMuted,
    isRemoteDisplayed
  }
}

export default usePeer
