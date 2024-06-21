import Button from "../../../components/Button"
import { useNavigate, useParams } from "react-router-dom"
import { trpc } from "../../../lib/trpcClient"
import useUser from "../../../hooks/useUser"
import Avatar from "../../../components/avatar/Avatar"
import usePeerConnection from "../../../stores/peerConnection"
import { useEffect, useState } from "react"
import { ArrowLeft, Mic, MicOff, Phone, Video, VideoOff } from "lucide-react"
import { cn } from "../../../utils/utils"
import ringingPath from "../../../../public/ringing.mp3"
import { socket } from "../../../lib/socket"
import { Peer } from "peerjs"
import { SocketCallPayload } from "../../../../../server/src/types/sockets"
import { playSound } from "../../../utils/file"

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

const RTCVoiceCall = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { chatroomId } = useParams<{
    chatroomId: string
  }>()
  // const { startCall, createOfferAndListenICE, cleanUp, peerConnection } = useWebRTC()
  const { setIsCalling, setCallInfo, setIsCallAccepted } = usePeerConnection((state) => state.actions)
  const { isCalling, isCallAccepted, callInfo } = usePeerConnection((state) => ({
    isCalling: state.isCalling,
    isCallAccepted: state.isCallAccepted,
    callInfo: state.callInfo
  }))
  const [peerConnection, setPeerConnection] = useState<Peer | null>(null)
  const { data: chatroomUsers, isLoading } = trpc.chat.get.chatroom_users.useQuery(chatroomId!, {
    enabled: !!chatroomId,
    refetchOnMount: true
  })

  const videoCleanUp = (className: string) => {
    const video = document.querySelector(className) as HTMLVideoElement
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      video.srcObject = null
    }
  }

  const cleanup = () => {
    setCallInfo(null)
    setIsCallAccepted(false)
    videoCleanUp(".local-video")
    videoCleanUp(".remote-video")
    peerConnection?.off("call")
    peerConnection?.off("close")
    peerConnection?.destroy()
    peerConnection?.disconnect()
    setPeerConnection(null)
  }

  const hangUp = () => {
    const participants = chatroomUsers?.map((x) => x.user_id).filter((x) => x !== user?.id)
    if (peerConnection) {
      socket.emit("call", { type: "hangup", participants })
      cleanup()
    }
  }

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

  const startCall = (data: { chatroomId: string; participants: string[] }) => {
    const { participants, chatroomId } = data
    if (!user) return
    const { id, image_url, username } = user
    playSound("source1", ringingPath)
    setIsCalling(true)
    socket.emit("call", {
      type: "initiated",
      chatroomId,
      participants,
      caller: {
        id,
        image_url,
        username
      }
    } as SocketCallPayload)
  }

  const iconSize = 25
  const triggerBtn = (id: number) => {
    setButtons((state) => state.map((x, i) => (i === id ? { ...x, isOff: !x.isOff } : x)))
  }
  const [buttons, setButtons] = useState([
    {
      id: 0,
      onIcon: <Video size={iconSize} />,
      offIcon: <VideoOff size={iconSize} />,
      isOff: false,
      onClick: () => triggerBtn(0)
    },
    {
      id: 1,
      onIcon: <Mic size={iconSize} />,
      offIcon: <MicOff size={iconSize} />,
      isOff: false,
      onClick: () => triggerBtn(1)
    }
  ])

  const previousPage = () => {
    cleanup()
    navigate(-1)
  }

  return (
    <div className="relative flex h-[100svh] w-full flex-col items-center justify-center">
      {isLoading || !user || !chatroomId || !chatroomUsers ? (
        <div>Loading...</div>
      ) : (
        <>
          {!isCallAccepted && (
            <>
              <div className="absolute left-2 top-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white duration-200 hover:bg-neutral-800">
                <ArrowLeft onClick={previousPage} />
              </div>
              <div className="flex select-none flex-col items-center space-x-2 space-y-2">
                {chatroomUsers?.map(({ user_id, image_url }) => (
                  <div key={user_id}>
                    {user_id !== user.id && <Avatar image_url={image_url} className="mb-4 h-28 w-28" />}
                  </div>
                ))}
                <p>{isCalling ? "Calling..." : "Ready to call?"}</p>
                {!isCallAccepted && !isCalling && (
                  <Button
                    buttonColor="blue"
                    onClick={() =>
                      startCall({
                        chatroomId,
                        participants: chatroomUsers.map((user) => user.user_id)
                      })
                    }
                  >
                    Start Call
                  </Button>
                )}
              </div>
            </>
          )}
          {isCallAccepted && (
            <>
              <div id="video-calls" className="space-y-2 outline">
                <video className="local-video" autoPlay muted />
                <video className="remote-video" autoPlay />
              </div>
              <div className="fixed bottom-4 flex w-full items-center justify-center space-x-4">
                {buttons.map(({ onIcon, offIcon, id, onClick, isOff }) => (
                  <div
                    key={id}
                    onClick={onClick}
                    className={cn(
                      "flex h-max w-max cursor-pointer items-center justify-center rounded-full bg-white p-[10px] duration-200",
                      isOff ? "text-black" : "bg-neutral-800 hover:bg-neutral-700"
                    )}
                  >
                    {isOff ? offIcon : onIcon}
                  </div>
                ))}
                <div
                  id="hangup"
                  className="flex cursor-pointer items-center justify-center rounded-full bg-red-500 p-[10px] duration-200 hover:bg-red-400"
                  onClick={hangUp}
                >
                  <Phone size={iconSize} />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default RTCVoiceCall
