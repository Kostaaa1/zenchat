import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { trpc } from "../../lib/trpcClient";
import { useState } from "react";
import { TUserData } from "../../../../server/src/types/types";
import useUser from "../../hooks/useUser";
import Avatar from "../../components/avatar/Avatar";
import useModalStore from "../../lib/stores/modalStore";
import useGeneralStore from "../../lib/stores/generalStore";

export const DashboardHeader = ({
  userData,
  username,
}: {
  userData: TUserData | undefined | null;
  username: string | undefined;
}) => {
  const navigate = useNavigate();
  const { userData: loggedUser } = useUser();
  const isMobile = useGeneralStore((state) => state.isMobile);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isAvatarUpdating = useModalStore((state) => state.isAvatarUpdating);
  const utils = trpc.useUtils();
  const { openModal, setImageSource } = useModalStore((state) => state.actions);

  const handleGetChatRoomId = async () => {
    if (!userData || !loggedUser) return;
    setIsLoading(true);

    await utils.chat.get.user_chatrooms.invalidate(loggedUser.id);
    const chatroomIdQuery = {
      userIds: [userData.id, loggedUser.id],
      admin: loggedUser.id,
    };

    await utils.chat.get.chatroom_id.invalidate(chatroomIdQuery);
    const path = await utils.chat.get.chatroom_id.fetch(chatroomIdQuery);
    if (path) {
      setIsLoading(false);
      navigate(`/inbox/${path}`);
    }
  };

  const handleClick = () => {
    if (!isAvatarUpdating && userData && userData.image_url) {
      setImageSource(userData.image_url);
      openModal("image");
    }
  };

  return (
    <div className="flex h-max max-w-full items-center justify-start py-4 pb-8 md:justify-center">
      <div className="relative flex items-center pr-6 sm:justify-start md:mb-0">
        <Avatar
          onClick={handleClick}
          image_url={userData?.image_url}
          size={isMobile ? "xl" : "xxl"}
          enableHover={true}
          isLoading={isAvatarUpdating}
        />
      </div>
      <div className="flex flex-col space-y-4 p-0">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="pr-2 text-2xl">{userData?.username}</h1>
          {username !== userData?.username ? (
            <Button isLoading={isLoading} onClick={handleGetChatRoomId}>
              Message
            </Button>
          ) : (
            <div className="space-y-1">
              <Button
                onClick={() => openModal("editprofile")}
                className="mr-1 text-xs sm:text-sm"
              >
                Edit profile
              </Button>
              <Button
                onClick={() => openModal("uploadpost")}
                className="text-xs sm:text-sm"
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
          <span>{userData?.description ?? ""}</span>
        </div>
      </div>
    </div>
  );
};