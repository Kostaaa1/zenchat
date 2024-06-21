import { create } from "zustand"
import { SocketCallPayload } from "../../../server/src/types/sockets"

export type ActiveList = "inbox" | "user" | ""
type Store = {
  isCalling: boolean
  callerInfo: SocketCallPayload | null
  isCallAccepted: boolean
  actions: {
    setIsCallAccepted: (v: boolean) => void
    setCallerInfo: (s: SocketCallPayload | null) => void
    setIsCalling: (v: boolean) => void
    clearAll: () => void
  }
}

const usePeerConnectionStore = create<Store>(
  (set): Store => ({
    isCalling: false,
    isCallAccepted: false,
    callerInfo: null,
    actions: {
      setCallerInfo: (callerInfo: SocketCallPayload | null) => set({ callerInfo }),
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
