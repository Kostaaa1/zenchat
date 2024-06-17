import { create } from "zustand";

export type ActiveList = "inbox" | "user" | "";

type Store = {
  // peerConnection: RTCPeerConnection | null;
  isCalling: boolean;
  isCallAccepted: boolean;
  actions: {
    setIsCallAccepted: (v: boolean) => void;
    setIsCalling: (v: boolean) => void;
    // setPeerConnection: (v: RTCPeerConnection) => void;
    clearAll: () => void;
  };
};

const usePeerConnection = create<Store>(
  (set): Store => ({
    // peerConnection: null,
    isCalling: false,
    isCallAccepted: false,
    actions: {
      setIsCallAccepted: (isCallAccepted: boolean) => set({ isCallAccepted }),
      setIsCalling: (isCalling: boolean) => set({ isCalling }),
      // setPeerConnection: (conn: RTCPeerConnection) =>
      //   set({ peerConnection: conn }),
      clearAll: () =>
        set({
          // peerConnection: null,
          isCalling: false,
          isCallAccepted: false,
        }),
    },
  }),
);

export default usePeerConnection;
