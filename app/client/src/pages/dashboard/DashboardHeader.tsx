import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { trpc } from "../../utils/trpcClient";
import { useState } from "react";
import { TUserData } from "../../../../server/src/types/types";
import useUser from "../../hooks/useUser";
import Avatar from "../../components/avatar/Avatar";
import useModalStore from "../../utils/stores/modalStore";

export const DashboardHeader = ({
  userData,
  username,
}: {
  userData: TUserData | undefined | null;
  username: string | undefined;
}) => {
  const navigate = useNavigate();
  const { userData: loggedUser } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isAvatarUpdating = useModalStore((state) => state.isAvatarUpdating);
  const { chat } = trpc.useUtils();
  const { setIsEditProfileModalOpen, showImageModal, setIsDndUploadModalOpen } =
    useModalStore((state) => state.actions);

  const handleGetChatRoomId = async () => {
    setIsLoading(true);
    if (!userData || !loggedUser) return;

    const path = await chat.get.chatroom_id.fetch({
      userIds: [userData.id, loggedUser.id],
      admin: userData.id,
    });

    if (path) {
      setIsLoading(false);
      navigate(`/inbox/${path}`);
    }
  };

  const handleClick = () => {
    if (isAvatarUpdating) return;
    showImageModal(userData?.image_url as string);
  };

  return (
    // <div className="flex h-56 max-w-full items-center justify-center">
    <div className="h-max items-center justify-center py-4 pb-8 md:flex">
      <div className="relative mb-8 flex cursor-pointer items-center justify-center md:mb-0">
        <Avatar
          onClick={handleClick}
          className=""
          image_url={userData?.image_url}
          size="xxl"
          enableHover={true}
          isLoading={isAvatarUpdating}
        />
      </div>
      <div className="flex flex-col space-y-4 p-0 md:pl-16">
        <div className="flex items-start justify-between space-x-10">
          <h1 className="text-2xl">{userData?.username}</h1>
          {username !== userData?.username ? (
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="text-sm"
              >
                Edit profile
              </Button>
              <Button isLoading={isLoading} onClick={handleGetChatRoomId}>
                Message
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="text-sm"
              >
                Edit profile
              </Button>
              <Button
                onClick={() => setIsDndUploadModalOpen(true)}
                className="text-sm"
              >
                New post
              </Button>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold">
            {`${userData?.first_name} ${userData?.last_name}`}
          </h4>
          <span>Lorem ipsum dolor sit amet.</span>
        </div>
      </div>
    </div>
  );
};
