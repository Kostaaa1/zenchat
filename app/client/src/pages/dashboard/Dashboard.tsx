import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { Loader2 } from "lucide-react";
import { trpc } from "../../utils/trpcClient";
import ErrorPage from "../ErrorPage";
import { FC, useEffect, useMemo, useState } from "react";
import { TUserData } from "../../../../server/src/types/types";
import useUser from "../../hooks/useUser";
import Avatar from "../../components/avatar/Avatar";
import useModalStore from "../../utils/stores/modalStore";
import { cn } from "../../utils/utils";
import Icon from "../main/components/Icon";

type SeparatorProps = {
  className?: string;
};

const Separator: FC<SeparatorProps> = ({ className }) => {
  return <div className={cn("h-[2px] w-full bg-[#262626]", className)}></div>;
};

const DashboardHeader = ({
  userData,
  username,
}: {
  userData: TUserData | undefined | null;
  username: string | undefined;
}) => {
  const navigate = useNavigate();
  const { userData: loggedUser } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setIsEditProfileModalOpen, showImageModal, setImageModalSource } =
    useModalStore((state) => state.actions);
  const isAvatarUpdating = useModalStore((state) => state.isAvatarUpdating);
  const { chat } = trpc.useUtils();

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
    setImageModalSource(userData?.image_url as string);
    showImageModal(userData?.image_url as string);
  };

  return (
    // <div className="mx-16 my-4 flex h-max border-b border-[#262626] px-10 pb-10 outline">
    <div className="flex h-full max-h-[200px] items-center px-16">
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
      <div className="flex w-full flex-col pl-16">
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
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { userData } = useUser();
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);

  const isLoggedUserInspected = useMemo(() => {
    return userData?.username === username;
  }, [userData?.username, username]);

  const { data: inspectedUserData, isFetching } = trpc.user.get.useQuery(
    { data: username!, type: "username" },
    {
      enabled: !!userData && !!username && !isLoggedUserInspected,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="ml-80 flex min-h-screen w-full max-w-[1000px] flex-col px-4">
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
              <DashboardHeader
                username={userData?.username}
                userData={
                  isLoggedUserInspected || location.pathname === "/"
                    ? userData
                    : inspectedUserData
                }
              />
              <Separator className="my-4" />
              {userData?.username === username && (
                <div className="flex h-full justify-center">
                  <div className="flex h-max w-full flex-col items-center justify-center space-y-4 py-6">
                    <Icon
                      name="Camera"
                      className="rounded-full p-3 text-neutral-600 ring ring-inset ring-neutral-600"
                      size="78px"
                      strokeWidth="1"
                      onClick={() => setIsDndUploadModalOpen(true)}
                    />
                    <div className="space-y-2 text-center">
                      <h2 className="text-3xl font-extrabold">Your Gallery</h2>
                      <p>
                        The photos from gallery will appear on your profile.
                      </p>
                      <p
                        className="cursor-pointer text-blue-500 transition-colors hover:text-blue-300"
                        onClick={() => setIsDndUploadModalOpen(true)}
                      >
                        Upload the photo
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
