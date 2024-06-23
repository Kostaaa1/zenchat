import { create } from "zustand"
import Peer from "peerjs"
import { SocketCallPayload } from "../../../server/src/types/types"

export type ActiveList = "inbox" | "user" | ""

type Store = {
  isCalling: boolean
  isCallAccepted: boolean
  callInfo: SocketCallPayload | null
  peerConnections: Peer[]
  isVideoMuted: boolean
  isVideoDisplayed: boolean
  actions: {
    setIsVideo: (isVideo: boolean) => void
    toggleMuteVideo: () => void
    toggleShowVideo: () => void
    setPeerConnections: (peerConnections: Peer[]) => void
    setIsCallAccepted: (v: boolean) => void
    setCallInfo: (callInfo: SocketCallPayload | null) => void
    setIsCalling: (v: boolean) => void
    clearAll: () => void
  }
}

const usePeerConnectionStore = create<Store>(
  (set): Store => ({
    isCalling: false,
    isCallAccepted: false,
    peerConnections: [],
    callInfo: null,
    isVideoMuted: false,
    isVideoDisplayed: false,
    actions: {
      setIsVideo: (isVideoDisplayed: boolean) => set({ isVideoDisplayed }),
      toggleMuteVideo: () => set((state) => ({ isVideoMuted: !state.isVideoMuted })),
      toggleShowVideo: () => set((state) => ({ isVideoDisplayed: !state.isVideoDisplayed })),
      setPeerConnections: (peerConnections: Peer[]) => set({ peerConnections }),
      setCallInfo: (callInfo: SocketCallPayload | null) => set({ callInfo }),
      setIsCallAccepted: (isCallAccepted: boolean) => set({ isCallAccepted }),
      setIsCalling: (isCalling: boolean) => set({ isCalling }),
      clearAll: () =>
        set({
          peerConnections: [],
          isCallAccepted: false,
          callInfo: null,
          isCalling: false,
          isVideoDisplayed: false,
          isVideoMuted: false
        })
    }
  })
)

export default usePeerConnectionStore
