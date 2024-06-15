import { create } from "zustand";

export type ActiveList = "inbox" | "user" | "";

type Store = {
  peerConnection: RTCPeerConnection | null;
  actions: {
    setPeerConnection: (conn: RTCPeerConnection) => void;
  };
};

const usePeerConnection = create<Store>(
  (set): Store => ({
    peerConnection: null,
    actions: {
      setPeerConnection: (conn: RTCPeerConnection) =>
        set({ peerConnection: conn }),
    },
  }),
);

export default usePeerConnection;
