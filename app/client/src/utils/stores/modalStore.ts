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
  messageDropdownData: { id: string; imageUrl: string | null } | null;
  showUnsendMsgModal: boolean;
  isMessageDropdownActive: boolean;
  isCreateGroupChatModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  isAvatarUpdating: boolean;
  isDeleteChatOpen: boolean;
  isDndUploadModalOpen: boolean;
  modalPostData: TPost | null;
  actions: {
    setModalPostData: (s: TPost | null) => void;
    setIsDndUploadModalOpen: (isOpen: boolean) => void;
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
    },
  }),
);

export default useModalStore;
