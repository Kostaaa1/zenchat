import useModalStore from "../../utils/stores/modalStore";
import EditProfileModal from "./EditProfileModal";
import ImageModal from "./ImageModal";
import CreateGroupChatModal from "./CreateGroupChatModal";
import UnsendMessageModal from "./UnsendMessageModal";
import DeleteChatModal from "./DeleteChatModal";

const Modals = () => {
  const {
    isCreateGroupChatModalOpen,
    isImageModalOpen,
    imageModalSource,
    showUnsendMsgModal,
    isEditProfileModalOpen,
    isDeleteChatOpen,
  } = useModalStore();

  return (
    <>
      {isImageModalOpen && imageModalSource && <ImageModal />}
      {showUnsendMsgModal && <UnsendMessageModal />}
      {isCreateGroupChatModalOpen && <CreateGroupChatModal />}
      {isEditProfileModalOpen && <EditProfileModal />}
      {isDeleteChatOpen && <DeleteChatModal />}
    </>
  );
};

export default Modals;
