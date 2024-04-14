import { create } from "zustand";

export type ActiveList = "inbox" | "user" | "";
type TOpenMessageDropdown = {
  id: string;
  imageUrl: string | null;
};

type Store = {
  isImageModalOpen: boolean;
  imageModalSource: string;
  messageDropdownData: { id: string; imageUrl: string | null } | null;
  showUnsendMsgModal: boolean;
  isMessageDropdownActive: boolean;
  isCreateGroupChatModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  isAvatarUpdating: boolean;
  isDeleteChatOpen: boolean;
  actions: {
    setImageModalSource: (src: string) => void;
    setMessageDropdownData: (data: TOpenMessageDropdown | null) => void;
    showImageModal: (messageContent: string) => void;
    closeImageModal: () => void;
    setShowUnsendMsgModal: (val: boolean) => void;
    setIsMessageDropdownActive: (isOpen: boolean) => void;
    setIsCreateGroupChatModalOpen: (isOpen: boolean) => void;
    setIsEditProfileModalOpen: (isOpen: boolean) => void;
    setIsAvatarUpdating: (isUpdating: boolean) => void;
    setIsDeleteChatOpen: (isUpdating: boolean) => void;
  };
};

const useModalStore = create<Store>(
  (set): Store => ({
    isDeleteChatOpen: false,
    isAvatarUpdating: false,
    isEditProfileModalOpen: false,
    isCreateGroupChatModalOpen: false,
    messageDropdownData: null,
    isMessageDropdownActive: false,
    showUnsendMsgModal: false,
    imageModalSource: "",
    isImageModalOpen: false,
    actions: {
      setIsDeleteChatOpen: (isUpdaing: boolean) =>
        set({ isDeleteChatOpen: isUpdaing }),
      setIsAvatarUpdating: (isUpdaing: boolean) =>
        set({ isAvatarUpdating: isUpdaing }),
      setIsEditProfileModalOpen: (isOpen: boolean) =>
        set({ isEditProfileModalOpen: isOpen }),
      setIsCreateGroupChatModalOpen: (open: boolean) =>
        set({ isCreateGroupChatModalOpen: open }),
      setMessageDropdownData: (data: TOpenMessageDropdown | null) =>
        set({ messageDropdownData: data }),
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
      setImageModalSource: (src: string) => set({ imageModalSource: src }),
    },
  }),
);

export default useModalStore;
