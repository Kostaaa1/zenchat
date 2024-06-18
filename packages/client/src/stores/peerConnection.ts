import { create } from "zustand"

export type ActiveList = "inbox" | "user" | ""
type Store = {
  isCalling: boolean
  isCallAccepted: boolean
  peerConnection: RTCPeerConnection | null
  actions: {
    setPeerConnetcion: (conn: RTCPeerConnection | null) => void
    setIsCallAccepted: (v: boolean) => void
    setIsCalling: (v: boolean) => void
    clearAll: () => void
  }
}

const usePeerConnection = create<Store>(
  (set): Store => ({
    isCalling: false,
    isCallAccepted: false,
    peerConnection: null,
    actions: {
      setPeerConnetcion: (conn: RTCPeerConnection | null) => set({ peerConnection: conn }),
      setIsCallAccepted: (isCallAccepted: boolean) => set({ isCallAccepted }),
      setIsCalling: (isCalling: boolean) => set({ isCalling }),
      clearAll: () =>
        set((state) => {
          const { peerConnection } = state
          if (peerConnection) {
            peerConnection.onicecandidate = null
            peerConnection.ontrack = null
            peerConnection.oniceconnectionstatechange = null
            peerConnection.close()
          }
          return {
            isCallAccepted: false,
            isCalling: false,
            peerConnection: null
          }
        })
      // clearAll: () =>
      //   set({
      //     isCalling: false,
      //     isCallAccepted: false
      //   })
    }
  })
)

export default usePeerConnection
