import { create, useStore } from "zustand";

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
  messageDropdownData: { id: string; imageUrl: string | null } | null;
  setMessageDropdownData: (data: TOpenMessageDropdown | null) => void;
  // Modals:
  showUnsendMsgModal: boolean;
  setShowUnsendMsgModal: (val: boolean) => void;
  isMessageDropdownActive: boolean;
  setIsMessageDropdownActive: (isOpen: boolean) => void;
  isCreateGroupChatModalOpen: boolean;
  setIsCreateGroupChatModalOpen: (isOpen: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (isOpen: boolean) => void;
  isAvatarUpdating: boolean;
  setIsAvatarUpdating: (isUpdating: boolean) => void;
  isDeleteChatOpen: boolean;
  setIsDeleteChatOpen: (isUpdating: boolean) => void;
};

const useModalStore = create<Store>(
  (set): Store => ({
    isDeleteChatOpen: false,
    setIsDeleteChatOpen: (isUpdaing: boolean) =>
      set((state) => ({
        ...state,
        isDeleteChatOpen: isUpdaing,
      })),
    isAvatarUpdating: false,
    setIsAvatarUpdating: (isUpdaing: boolean) =>
      set((state) => ({
        ...state,
        isAvatarUpdating: isUpdaing,
      })),
    isEditProfileModalOpen: false,
    setIsEditProfileModalOpen: (isOpen: boolean) =>
      set((state) => ({
        ...state,
        isEditProfileModalOpen: isOpen,
      })),
    isCreateGroupChatModalOpen: false,
    setIsCreateGroupChatModalOpen: (open: boolean) =>
      set((state) => ({
        ...state,
        isCreateGroupChatModalOpen: open,
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
