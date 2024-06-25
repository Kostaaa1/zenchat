import Button from "../../../components/Button"
import { useNavigate, useParams } from "react-router-dom"
import { trpc } from "../../../lib/trpcClient"
import useUser from "../../../hooks/useUser"
import Avatar from "../../../components/avatar/Avatar"
import { useState } from "react"
import { ArrowLeft, Mic, MicOff, Phone, Video, VideoOff } from "lucide-react"
import { cn } from "../../../utils/utils"
import { socket } from "../../../lib/socket"
import { SocketCallPayload } from "../../../../../server/src/types/types"
import usePeer from "../../../hooks/usePeer"

const RTCVoiceCall = () => {
  const { callInfo, activateParticipant, remoteVideos, cleanup, hangup, isCallAccepted, isCalling, startCall } =
    usePeer()
  const navigate = useNavigate()
  const { user } = useUser()
  const { chatroomId } = useParams<{
    chatroomId: string
  }>()
  const { data: chatroomUsers, isLoading } = trpc.chat.get.chatroom_users.useQuery(chatroomId!, {
    enabled: !!chatroomId,
    refetchOnMount: true
  })

  const triggerBtn = (id: number) => {
    setButtons((state) => state.map((x, i) => (i === id ? { ...x, isOff: !x.isOff } : x)))
    if (callInfo && user) {
      const p = {
        chatroomId: callInfo.chatroomId,
        participants: activateParticipant(callInfo.participants, user!.id)
      } as SocketCallPayload
      switch (id) {
        case 0:
          p.type = "show-remote"
          socket.emit("call", p)
          break
        case 1:
          p.type = "mute-remote"
          socket.emit("call", p)
          break
      }
    }
  }
  const iconSize = 25
  const [buttons, setButtons] = useState([
    {
      id: 0,
      onIcon: <Video size={iconSize} />,
      offIcon: <VideoOff size={iconSize} />,
      isOff: false
    },
    {
      id: 1,
      onIcon: <Mic size={iconSize} />,
      offIcon: <MicOff size={iconSize} />,
      isOff: false
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
          {!isCallAccepted ? (
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
                        type: "initiated",
                        participants: chatroomUsers.map(({ user_id, image_url, username }) => ({
                          is_caller: user.id === user_id,
                          id: user_id,
                          image_url,
                          username
                        }))
                      })
                    }
                  >
                    Start Call
                  </Button>
                )}
              </div>
            </>
          ) : null}
          {callInfo && isCallAccepted && (
            <>
              <div id="video-calls" className="h-full space-y-2 outline">
                <video className="local-video" autoPlay muted />
                <>
                  {remoteVideos.map(({ id, isVideoDisplayed }) => (
                    <div
                      key={id}
                      id={id}
                      className="flex h-full w-full items-center justify-center outline"
                      style={{ display: isVideoDisplayed ? "none" : "" }}
                    >
                      <img
                        src={user.image_url ?? ""}
                        className="pointer-events-none absolute left-0 top-0 h-full w-full blur-[400px]"
                      />
                      <Avatar image_url={user.image_url} size="xxl" />
                    </div>
                  ))}
                </>
              </div>
              <div className="fixed bottom-4 flex w-full items-center justify-center space-x-4">
                {buttons.map(({ onIcon, offIcon, id, isOff }) => (
                  <div
                    key={id}
                    onClick={() => triggerBtn(id)}
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
                  onClick={hangup}
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
