import { create } from "zustand"
import { SocketCallPayload } from "../../../server/src/types/sockets"
import Peer from "peerjs"

export type ActiveList = "inbox" | "user" | ""

type Store = {
  isCalling: boolean
  isCallAccepted: boolean
  peerConnections: Peer[]
  callInfo: SocketCallPayload | null
  actions: {
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
    actions: {
      setCallInfo: (callInfo: SocketCallPayload | null) => set({ callInfo }),
      setPeerConnections: (peerConnections: Peer[]) => set({ peerConnections }),
      setIsCallAccepted: (isCallAccepted: boolean) => set({ isCallAccepted }),
      setIsCalling: (isCalling: boolean) => set({ isCalling }),
      clearAll: () =>
        set({
          isCallAccepted: false,
          isCalling: false
        })
    }
  })
)

export default usePeerConnectionStore
