import { create } from "zustand";
import { TPost } from "../../../../server/src/types/types";

export type ActiveList = "inbox" | "user" | "";
type TOpenMessageDropdown = {
  id: string;
  imageUrl: string | null;
};

type Store = {
  isImageModalOpen: boolean;
  imageModalSource: string;
  unsendMsgData: { id: string; imageUrl: string | null } | null;
  showUnsendMsgModal: boolean;
  isMessageDropdownActive: boolean;
  isNewMessageModalModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  isAvatarUpdating: boolean;
  isDeleteChatOpen: boolean;
  isDndUploadModalOpen: boolean;
  modalPostData: TPost | null;
  actions: {
    setModalPostData: (s: TPost | null) => void;
    setIsDndUploadModalOpen: (isOpen: boolean) => void;
    setUnsendMsgData: (data: TOpenMessageDropdown | null) => void;
    showImageModal: (messageContent: string) => void;
    closeImageModal: () => void;
    setShowUnsendMsgModal: (val: boolean) => void;
    setIsMessageDropdownActive: (isOpen: boolean) => void;
    setIsNewMessageModalModalOpen: (isOpen: boolean) => void;
    setIsEditProfileModalOpen: (isOpen: boolean) => void;
    setIsAvatarUpdating: (isUpdating: boolean) => void;
    setIsDeleteChatOpen: (isUpdating: boolean) => void;
    closeAllModals: () => void;
  };
};

const useModalStore = create<Store>(
  (set): Store => ({
    isDeleteChatOpen: false,
    isAvatarUpdating: false,
    isEditProfileModalOpen: false,
    isNewMessageModalModalOpen: false,
    unsendMsgData: null,
    isMessageDropdownActive: false,
    showUnsendMsgModal: false,
    imageModalSource: "",
    isImageModalOpen: false,
    isDndUploadModalOpen: false,
    modalPostData: null,
    actions: {
      setModalPostData: (modalPostData: TPost | null) => set({ modalPostData }),
      setIsDndUploadModalOpen: (v: boolean) => set({ isDndUploadModalOpen: v }),
      setIsDeleteChatOpen: (isUpdaing: boolean) =>
        set({ isDeleteChatOpen: isUpdaing }),
      setIsAvatarUpdating: (isUpdaing: boolean) =>
        set({ isAvatarUpdating: isUpdaing }),
      setIsEditProfileModalOpen: (isOpen: boolean) =>
        set({ isEditProfileModalOpen: isOpen }),
      setIsNewMessageModalModalOpen: (open: boolean) =>
        set({ isNewMessageModalModalOpen: open }),
      setUnsendMsgData: (data: TOpenMessageDropdown | null) =>
        set({ unsendMsgData: data }),
      setIsMessageDropdownActive: (isOpen: boolean) =>
        set({ isMessageDropdownActive: isOpen }),
      setShowUnsendMsgModal: (bool: boolean) =>
        set({ showUnsendMsgModal: bool }),
      showImageModal: (messageContent: string) =>
        set({
          imageModalSource: messageContent,
          isImageModalOpen: true,
        }),
      closeImageModal: () =>
        set({
          imageModalSource: "",
          isImageModalOpen: false,
        }),
      closeAllModals: () =>
        set({
          // isDndUploadModalOpen: false,
          imageModalSource: "",
          isEditProfileModalOpen: false,
          modalPostData: null,
          showUnsendMsgModal: false,
          isDeleteChatOpen: false,
          isImageModalOpen: false,
          isNewMessageModalModalOpen: false,
          isMessageDropdownActive: false,
          isAvatarUpdating: false,
        }),
    },
  }),
);

export default useModalStore;
