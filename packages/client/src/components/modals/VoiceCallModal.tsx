import { forwardRef, useEffect } from "react"
import { Modal } from "./Modals"
import { cn } from "../../utils/utils"
import { PhoneCall, PhoneMissed } from "lucide-react"
import useModalStore from "../../stores/modalStore"
import Avatar from "../avatar/Avatar"
import useGeneralStore from "../../stores/generalStore"
import incomming from "../../../public/incomming.mp3"
import usePeerConnection from "../../stores/peerConnection"
import { socket } from "../../lib/socket"
import { useNavigate } from "react-router-dom"
import { playSound } from "../../utils/file"
import { SocketCallPayload } from "../../../../server/src/types/types"
import useUser from "../../hooks/useUser"
import usePeer from "../../hooks/usePeer"

type ModalProps = {
  callInfo: SocketCallPayload
}

const VoiceCallModal = forwardRef<HTMLDivElement, ModalProps>(({ callInfo }, ref) => {
  const { setIsCallAccepted, setCallInfo } = usePeerConnection((state) => state.actions)
  const { user } = useUser()
  const { chatroomId, participants } = callInfo
  const volume = useGeneralStore((state) => state.volume)
  const navigate = useNavigate()
  const { closeModal } = useModalStore((state) => state.actions)
  const { activateParticipant } = usePeer()

  // const playSound = (id: string, path: string, volume?: number) => {
  //   const init = document.getElementById(id)
  //   if (init) {
  //     const el = init as HTMLAudioElement
  //     el.src = path
  //     el.volume = volume || 0.05
  //     el.play()
  //   }
  // }

  const stopRinging = () => {
    const init = document.getElementById("ring")
    if (init) {
      const el = init as HTMLAudioElement
      el.src = incomming
      el.volume = volume
      el.pause()
    }
  }
  ////////////////////////////////
  const pickup = () => {
    const { chatroomId, participants } = callInfo
    setIsCallAccepted(true)
    const payload: SocketCallPayload = {
      type: "accepted",
      chatroomId,
      participants: participants.map((x) =>
        x.id === user!.id ? { ...x, is_caller: false } : { ...x, is_caller: true }
      )
    }
    socket.emit("call", payload)
    stopRinging()
    closeModal()
    if (!location.pathname.includes("/call")) {
      navigate(`/call/${chatroomId}`)
    }
  }

  const hangup = () => {
    stopRinging()
    const payload: SocketCallPayload = {
      type: "declined",
      participants: activateParticipant(participants, user!.id),
      chatroomId
    }
    socket.emit("call", payload)
    setCallInfo(null)
    closeModal()
  }

  useEffect(() => {
    playSound("ring", incomming, volume)
    const timeout = setTimeout(() => {
      console.log("CALL TIME EXCEEDED, HHANG UPHANG UPHANG UPANG UP!!!!")
      hangup()
    }, 20000)
    return () => {
      clearTimeout(timeout)
    }
  }, [closeModal])

  return (
    <Modal>
      <div ref={ref} className={cn("relative mx-auto max-h-[90svh] w-full")}>
        <div className="flex w-max flex-col space-y-3 rounded-2xl bg-neutral-800 p-4">
          {participants.map((participant) => (
            <div key={participant.id}>
              {participant.is_caller && (
                <div className="flex flex-col items-center justify-center">
                  {participant.image_url && (
                    <div className="rounded-full">
                      <Avatar image_url={participant.image_url} className="h-14 w-14" />
                    </div>
                  )}
                  <p>{participant.username} is calling you</p>
                </div>
              )}
            </div>
          ))}

          <div className="flex w-full justify-between">
            <PhoneCall onClick={pickup} className="h-10 w-10 cursor-pointer rounded-full bg-green-600 p-2" />
            <PhoneMissed onClick={hangup} className="h-10 w-10 cursor-pointer rounded-full bg-red-600 p-2" />
          </div>
        </div>
      </div>
      <audio id="ring" loop />
      {/* <audio id="ring" loop autoPlay src={incomming} /> */}
    </Modal>
  )
})

export default VoiceCallModal
