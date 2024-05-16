import { create } from "zustand";
import { TPost } from "../../../../server/src/types/types";

type TOpenMessageDropdown = {
  id: string;
  imageUrl: string | null;
};

type Modals =
  | "image"
  | "editprofile"
  | "newmessage"
  | "deletechat"
  | "uploadpost"
  | "unsendmessage"
  | "post"
  | null;

type Store = {
  isModalOpen: boolean;
  imageSource: string | null;
  unsendMsgData: { id: string; imageUrl: string | null } | null;
  modalPostData: TPost | null;
  isMessageDropdownActive: boolean;
  isAvatarUpdating: boolean;
  activeModal: Modals;
  actions: {
    openModal: (activeModal: Modals) => void;
    closeModal: () => void;
    setImageSource: (src: string) => void;
    setModalPostData: (s: TPost | null) => void;
    setUnsendMsgData: (data: TOpenMessageDropdown | null) => void;
    setIsMessageDropdownActive: (isOpen: boolean) => void;
    setIsAvatarUpdating: (isUpdating: boolean) => void;
  };
};

const useModalStore = create<Store>(
  (set): Store => ({
    isModalOpen: false,
    activeModal: null,
    isAvatarUpdating: false,
    unsendMsgData: null,
    isMessageDropdownActive: false,
    imageSource: null,
    modalPostData: null,
    actions: {
      openModal: (activeModal: Modals) =>
        set({ isModalOpen: true, activeModal }),
      closeModal: () =>
        set({
          imageSource: null,
          modalPostData: null,
          isMessageDropdownActive: false,
          isAvatarUpdating: false,
          isModalOpen: false,
          activeModal: null,
        }),
      //////
      setImageSource: (imageSource: string) => set({ imageSource }),
      setModalPostData: (modalPostData: TPost | null) => set({ modalPostData }),
      setIsAvatarUpdating: (isUpdaing: boolean) =>
        set({ isAvatarUpdating: isUpdaing }),
      setUnsendMsgData: (data: TOpenMessageDropdown | null) =>
        set({ unsendMsgData: data }),
      setIsMessageDropdownActive: (isOpen: boolean) =>
        set({ isMessageDropdownActive: isOpen }),
    },
  }),
);

export default useModalStore;
