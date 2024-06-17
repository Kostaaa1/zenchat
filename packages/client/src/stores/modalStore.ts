import { create } from "zustand";
import { TMessage, TPost } from "../../../server/src/types/types";
import { SocketCallPayload } from "../../../server/src/types/sockets";

type Modals =
  | "image"
  | "editprofile"
  | "newmessage"
  | "deletechat"
  | "uploadpost"
  | "unsendmessage"
  | "post"
  | "voiceCall"
  | null;

type Store = {
  isModalOpen: boolean;
  imageSource: string | null;
  activeMessage: TMessage | null;
  modalPostData: TPost | null;
  isMessageDropdownActive: boolean;
  isAvatarUpdating: boolean;
  activeModal: Modals;
  isModalOptionsOpen: boolean;
  callerInfo: SocketCallPayload | null;
  actions: {
    setCallerInfo: (s: SocketCallPayload | null) => void;
    triggerModalOptions: () => void;
    openModal: (activeModal: Modals) => void;
    closeModal: () => void;
    setImageSource: (src: string) => void;
    setModalPostData: (s: TPost | null) => void;
    setActiveMessage: (data: TMessage | null) => void;
    setIsMessageDropdownActive: (isOpen: boolean) => void;
    setIsAvatarUpdating: (isUpdating: boolean) => void;
  };
};

const useModalStore = create<Store>(
  (set): Store => ({
    isModalOpen: false,
    activeModal: null,
    isAvatarUpdating: false,
    activeMessage: null,
    isMessageDropdownActive: false,
    imageSource: null,
    modalPostData: null,
    isModalOptionsOpen: false,
    callerInfo: null,
    actions: {
      setCallerInfo: (callerInfo: SocketCallPayload | null) =>
        set({ callerInfo }),
      triggerModalOptions: () =>
        set((state) => ({ isModalOptionsOpen: !state.isModalOptionsOpen })),
      openModal: (activeModal: Modals) =>
        set({ isModalOpen: true, activeModal }),
      closeModal: () =>
        set((state) => {
          if (state.isModalOptionsOpen) {
            return { ...state, isModalOptionsOpen: !state.isModalOptionsOpen };
          } else {
            return {
              ...state,
              imageSource: null,
              modalPostData: null,
              isMessageDropdownActive: false,
              isAvatarUpdating: false,
              isModalOpen: false,
              activeModal: null,
            };
          }
        }),
      setImageSource: (imageSource: string) => set({ imageSource }),
      setModalPostData: (modalPostData: TPost | null) => set({ modalPostData }),
      setIsAvatarUpdating: (isUpdaing: boolean) =>
        set({ isAvatarUpdating: isUpdaing }),
      setActiveMessage: (data: TMessage | null) => set({ activeMessage: data }),
      setIsMessageDropdownActive: (isOpen: boolean) =>
        set({ isMessageDropdownActive: isOpen }),
    },
  }),
);

export default useModalStore;
