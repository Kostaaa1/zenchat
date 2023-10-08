import { create } from "zustand";

export type ActiveList = "inbox" | "user" | "";
type TOpenMessageDropdown = {
  id: string;
  imageUrl: string | null;
};

type Store = {
  isImageModalOpen: boolean;
  imageModalSource: string;
  setImageModalSource: (src: string) => void;
  showImageModal: (messageContent: string) => void;
  closeImageModal: () => void;
  showUnsendMsgModal: boolean;
  setShowUnsendMsgModal: (val: boolean) => void;
  isMessageDropdownActive: boolean;
  setIsMessageDropdownActive: (isOpen: boolean) => void;
  messageDropdownData: { id: string; imageUrl: string | null } | null;
  setMessageDropdownData: (data: TOpenMessageDropdown | null) => void;
  isSendMessageModalActive: boolean;
  setIsSendMessageModalActive: (isOpen: boolean) => void;
};

const useModalStore = create<Store>(
  (set): Store => ({
    isSendMessageModalActive: false,
    setIsSendMessageModalActive: (open: boolean) =>
      set((state) => ({
        ...state,
        isSendMessageModalActive: open,
      })),
    // Message dropdown (show more, copy...) // UnsendModal data..
    messageDropdownData: null,
    setMessageDropdownData: (data: TOpenMessageDropdown | null) =>
      set((state) => ({
        ...state,
        messageDropdownData: data,
      })),
    isMessageDropdownActive: false,
    setIsMessageDropdownActive: (isOpen: boolean) =>
      set((state) => ({
        ...state,
        isMessageDropdownActive: isOpen,
      })),
    showUnsendMsgModal: false,
    setShowUnsendMsgModal: (bool: boolean) =>
      set((state) => ({
        ...state,
        showUnsendMsgModal: bool,
      })),
    // Image modal:
    showImageModal: (messageContent: string) =>
      set((state) => ({
        ...state,
        imageModalSource: messageContent,
        isImageModalOpen: true,
      })),
    closeImageModal: () =>
      set((state) => ({
        ...state,
        imageModalSource: "",
        isImageModalOpen: false,
      })),
    imageModalSource: "",
    setImageModalSource: (src: string) =>
      set((state) => ({
        ...state,
        imageModalSource: src,
      })),
    isImageModalOpen: false,
  }),
);

export default useModalStore;
