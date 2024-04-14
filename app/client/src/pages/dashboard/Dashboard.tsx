import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { Loader2 } from "lucide-react";
import { trpc } from "../../utils/trpcClient";
import ErrorPage from "../ErrorPage";
import { useEffect, useState } from "react";
import { TUserData } from "../../../../server/src/types/types";
import useUser from "../../hooks/useUser";
import Avatar from "../../components/avatar/Avatar";
import useModalStore from "../../utils/stores/modalStore";
import { cn } from "../../utils/utils";
import Icon from "../main/components/Icon";

const UserBoarddash = ({
  userData,
  username,
}: {
  userData: TUserData | undefined | null;
  username: string | undefined;
}) => {
  const navigate = useNavigate();
  const { userData: inspectedUser } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setIsEditProfileModalOpen, showImageModal, setImageModalSource } =
    useModalStore((state) => state.actions);
  const isAvatarUpdating = useModalStore((state) => state.isAvatarUpdating);
  const { chat } = trpc.useUtils();

  const handleGetChatRoomId = async () => {
    setIsLoading(true);
    if (!userData || !inspectedUser) return;

    const path = await chat.get.chatroom_id.fetch({
      userIds: [userData.id, inspectedUser.id],
      admin: userData.id,
    });

    if (path) {
      setIsLoading(false);
      navigate(`/inbox/${path}`);
    }
  };

  const handleClick = () => {
    if (isAvatarUpdating) return;
    setImageModalSource(userData?.image_url as string);
    showImageModal(userData?.image_url as string);
  };

  return (
    <div className="mx-16 my-8 flex min-h-[160px] border-b border-[#262626] px-10 pb-10">
      <div className="relative" onClick={handleClick}>
        {isAvatarUpdating && (
          <div className="absolute h-full w-full animate-spin">
            <Loader2
              strokeWidth="1.2"
              className="absolute right-1/2 top-1/2 h-12 w-12 -translate-y-1/2 translate-x-1/2 "
            />
          </div>
        )}
        <div
          className={cn(
            "absolute h-full w-full cursor-pointer bg-black opacity-0 transition-all duration-200 hover:opacity-20",
            isAvatarUpdating && "opacity-20",
          )}
        ></div>
        <Avatar image_url={userData?.image_url} size="xxl" />
      </div>
      <div className="ml-16 flex w-full flex-col py-4">
        <div className="flex h-14 items-start justify-start">
          <h1 className="pr-8 text-2xl">{userData?.username}</h1>
          {username !== userData?.username ? (
            <>
              <Button isLoading={isLoading} onClick={handleGetChatRoomId}>
                Message
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="text-sm"
            >
              Edit Profile
            </Button>
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

const Dashboard = () => {
  const params = useParams<{ username: string }>();
  const { username } = params;
  const location = useLocation();
  const { userData } = useUser();
  const [isIndexRoute, setIsIndexRoute] = useState<boolean>(true);

  useEffect(() => {
    location.pathname === "/" ? setIsIndexRoute(true) : setIsIndexRoute(false);
  }, [location.pathname]);

  const { data: inspectedUserData, isFetching } = trpc.user.get.useQuery(
    { data: username as string, type: "username" },
    {
      enabled: !!userData && !!username && userData.username !== username,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <>
      <div className="ml-80 flex h-full w-full max-w-[1000px] flex-col px-4">
        {inspectedUserData === null ? (
          <ErrorPage />
        ) : (
          <>
            {isFetching ? (
              <div className="mt-10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            ) : (
              <>
                <UserBoarddash
                  username={userData?.username}
                  userData={
                    userData?.username === username || isIndexRoute
                      ? userData
                      : inspectedUserData
                  }
                />
                <div className="flex w-full items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-neutral-600">
                    <Icon
                      name="Camera"
                      className="text-neutral-600"
                      size="40px"
                      strokeWidth="1.2"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
