import { create } from "zustand"

export type ActiveList = "inbox" | "user" | ""
type Store = {
  isCalling: boolean
  isCallAccepted: boolean
  actions: {
    setIsCallAccepted: (v: boolean) => void
    setIsCalling: (v: boolean) => void
    clearAll: () => void
  }
}

const usePeerConnectionStore = create<Store>(
  (set): Store => ({
    isCalling: false,
    isCallAccepted: false,
    actions: {
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
