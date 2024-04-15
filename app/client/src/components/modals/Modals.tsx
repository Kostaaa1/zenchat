import useModalStore from "../../utils/stores/modalStore";
import EditProfileModal from "./EditProfileModal";
import ImageModal from "./ImageModal";
import CreateGroupChatModal from "./CreateGroupChatModal";
import UnsendMessageModal from "./UnsendMessageModal";
import DeleteChatModal from "./DeleteChatModal";
import DndUpload from "./DndUpload";

const Modals = () => {
  const isDndUploadModalOpen = useModalStore(
    (state) => state.isDndUploadModalOpen,
  );
  const isImageModalOpen = useModalStore((state) => state.isImageModalOpen);
  const imageModalSource = useModalStore((state) => state.imageModalSource);
  const showUnsendMsgModal = useModalStore((state) => state.showUnsendMsgModal);
  const isCreateGroupChatModalOpen = useModalStore(
    (state) => state.isCreateGroupChatModalOpen,
  );
  const isEditProfileModalOpen = useModalStore(
    (state) => state.isEditProfileModalOpen,
  );
  const isDeleteChatOpen = useModalStore((state) => state.isDeleteChatOpen);

  return (
    <>
      {isImageModalOpen && imageModalSource && <ImageModal />}
      {showUnsendMsgModal && <UnsendMessageModal />}
      {isCreateGroupChatModalOpen && <CreateGroupChatModal />}
      {isEditProfileModalOpen && <EditProfileModal />}
      {isDeleteChatOpen && <DeleteChatModal />}
      {isDndUploadModalOpen && <DndUpload />}
    </>
  );
};

export default Modals;
