import { create } from "zustand"
import { SocketCallPayload } from "../../../server/src/types/types"

export type ActiveList = "inbox" | "user" | ""

type RemoteVideo = {
  id: string
  isVideoDisplayed: boolean
  isVideoMuted: boolean
}

type Store = {
  isCalling: boolean
  isCallAccepted: boolean
  callInfo: SocketCallPayload | null
  remoteVideos: RemoteVideo[]
  isRemoteDisplayed: boolean
  isRemoteMuted: boolean
  actions: {
    setIsRemoteMuted: (s: boolean) => void
    setIsRemoteDisplayed: (s: boolean) => void
    setCallInfo: (callInfo: SocketCallPayload | null) => void
    setIsCalling: (v: boolean) => void
    setIsCallAccepted: (v: boolean) => void
    setRemoteVideos: (videos: RemoteVideo[]) => void
    addRemoteVideo: (video: RemoteVideo) => void
    removeRemoteVideo: (video: RemoteVideo) => void
    toggleDisplayVideo: () => void
    toggleMuteVideo: () => void
    clearAll: () => void
  }
}

const usePeerConnectionStore = create<Store>(
  (set): Store => ({
    callInfo: null,
    isCalling: false,
    isCallAccepted: false,
    remoteVideos: [],
    isRemoteDisplayed: false,
    isRemoteMuted: false,
    actions: {
      setIsRemoteDisplayed: (isRemoteDisplayed: boolean) => set({ isRemoteDisplayed }),
      setIsRemoteMuted: (isMuted: boolean) => set({ isRemoteMuted: isMuted }),
      addRemoteVideo: (video: RemoteVideo) => set((state) => ({ remoteVideos: [...state.remoteVideos, video] })),
      removeRemoteVideo: (video: RemoteVideo) =>
        set((state) => ({ remoteVideos: state.remoteVideos.filter((x) => x.id !== video.id) })),
      setRemoteVideos: (videos: RemoteVideo[]) => set({ remoteVideos: videos }),
      toggleDisplayVideo: () => set((state) => ({ isRemoteDisplayed: !state.isRemoteDisplayed })),
      toggleMuteVideo: () => set((state) => ({ isRemoteMuted: !state.isRemoteMuted })),
      setIsCallAccepted: (isCallAccepted: boolean) => set({ isCallAccepted }),
      setCallInfo: (callInfo: SocketCallPayload | null) => set({ callInfo }),
      setIsCalling: (isCalling: boolean) => set({ isCalling }),
      clearAll: () =>
        set({
          callInfo: null,
          isCallAccepted: false,
          isCalling: false,
          remoteVideos: []
        })
    }
  })
)

export default usePeerConnectionStore
