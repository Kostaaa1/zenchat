import Button from "../../../components/Button"
import { useParams } from "react-router-dom"
import { trpc } from "../../../lib/trpcClient"
import useUser from "../../../hooks/useUser"
import Avatar from "../../../components/avatar/Avatar"
import usePeerConnection from "../../../stores/peerConnection"
import { useEffect, useState } from "react"
import useWebRTC from "../../../hooks/useWebRTC"
import { Mic, MicOff, Phone, Video, VideoOff } from "lucide-react"
import { cn } from "../../../utils/utils"
import { socket } from "../../../lib/socket"

const RTCVoiceCall = () => {
  const { user } = useUser()
  const { chatroomId } = useParams<{
    chatroomId: string
  }>()
  const { startCall, createOfferAndListenICE, cleanUp, peerConnection } = useWebRTC()
  const { isCalling, isCallAccepted } = usePeerConnection((state) => ({
    isCalling: state.isCalling,
    isCallAccepted: state.isCallAccepted
  }))
  // const { setIsCalling } = usePeerConnection((state) => state.actions)
  const { data: chatroomUsers, isLoading } = trpc.chat.get.chatroom_users.useQuery(chatroomId!, {
    enabled: !!chatroomId,
    refetchOnMount: true
  })

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

  useEffect(() => {
    if (isCalling && isCallAccepted && chatroomUsers && chatroomId) {
      console.log("Creating offer, started negotiation.........")
      const receivers = chatroomUsers.map((x) => x.user_id)
      createOfferAndListenICE(receivers, chatroomId)
      // setIsCalling(false)
    }
  }, [isCalling, isCallAccepted, chatroomUsers, chatroomId])

  const hangUp = () => {
    const receivers = chatroomUsers?.map((x) => x.user_id).filter((x) => x !== user?.id)
    socket.emit("call", { type: "hangup", receivers })
    cleanUp()
  }

  useEffect(() => {
    return () => {
      console.log("You left the CALL page. Cleaning up...")
      cleanUp()
    }
  }, [cleanUp])

  return (
    <div className="relative flex h-[100svh] w-full flex-col items-center justify-center">
      {isLoading || !user || !chatroomId || !chatroomUsers ? (
        <div>Loading...</div>
      ) : (
        <>
          {!peerConnection && !isCallAccepted && (
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
                      receivers: chatroomUsers.map((user) => user.user_id)
                    })
                  }
                >
                  Start Call
                </Button>
              )}
            </div>
          )}
          {peerConnection && (
            <>
              <div id="video-calls" className="space-y-2">
                <video className="local-video" autoPlay muted />
                <video className="remote-video" autoPlay muted />
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
