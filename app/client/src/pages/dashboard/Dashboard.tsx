import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { Loader2 } from "lucide-react";
import { trpc } from "../../utils/trpcClient";
import ErrorPage from "../ErrorPage";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { TPost, TUserData } from "../../../../server/src/types/types";
import useUser from "../../hooks/useUser";
import Avatar from "../../components/avatar/Avatar";
import useModalStore from "../../utils/stores/modalStore";
import { cn, loadImage } from "../../utils/utils";
import Icon from "../main/components/Icon";
import Post from "./Post";
import useGeneralStore from "../../utils/stores/generalStore";

type SeparatorProps = {
  className?: string;
};

const Separator: FC<SeparatorProps> = ({ className }) => {
  return (
    <div className={cn("z-50 h-[2px] w-full bg-[#262626]", className)}></div>
  );
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
              <Button
                onClick={() => setIsDndUploadModalOpen(true)}
                className="text-sm"
              >
                New post
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

const Dashboard = () => {
  const { username } = useParams<{ username: string }>();
  const { userData } = useUser();
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  const isSearchActive = useGeneralStore((state) => state.isSearchActive);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const { data: inspectedUserData } = trpc.user.get.useQuery(
    { data: username!, type: "username" },
    {
      enabled: !!userData && !!username,
      // refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  );

  const loadImages = async (posts: TPost[]) => {
    await Promise.all(posts.map(async (x) => await loadImage(x.media_url)));
    setIsFetching(false);
  };

  useEffect(() => {
    if (!inspectedUserData) return;
    loadImages(inspectedUserData.posts);
  }, [inspectedUserData]);

  return (
    <div
      className={cn(
        "min-h-full w-full max-w-[1000px] px-4 py-2",
        isSearchActive || !isResponsive ? "ml-[300px]" : "ml-[80px]",
      )}
    >
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
                userData={inspectedUserData || userData}
              />
              <Separator className="mb-8" />
              {inspectedUserData?.posts.length === 0 ? (
                <div className="flex h-max w-full flex-col items-center justify-center space-y-4 py-6">
                  {userData?.username === username ? (
                    <>
                      <Icon
                        name="Camera"
                        className="rounded-full p-3 text-neutral-700 ring ring-inset ring-neutral-600"
                        size="78px"
                        strokeWidth="1"
                        onClick={() => setIsDndUploadModalOpen(true)}
                      />
                      <div className="space-y-2 text-center">
                        <h2 className="text-3xl font-extrabold">
                          Your Gallery
                        </h2>
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
                    </>
                  ) : (
                    <>
                      <Icon
                        name="Camera"
                        className="rounded-full p-3 text-neutral-700 ring ring-inset ring-neutral-600"
                        size="78px"
                        strokeWidth="1"
                        onClick={() => setIsDndUploadModalOpen(true)}
                      />
                      <div className="space-y-2 text-center">
                        <h2 className="text-3xl font-extrabold">
                          No Posts Yet
                        </h2>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 flex-wrap gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {inspectedUserData?.posts.map((post) => (
                    <Post key={post.id} post={post} />
                  ))}
                </div>
              )}
              {/* {userData!.username === username || location.pathname === "/" ? (
                <>
                  {userData?.posts.length === 0 ? (
                    <div className="flex h-max w-full flex-col items-center justify-center space-y-4 py-6">
                      <Icon
                        name="Camera"
                        className="rounded-full p-3 text-neutral-700 ring ring-inset ring-neutral-600"
                        size="78px"
                        strokeWidth="1"
                        onClick={() => setIsDndUploadModalOpen(true)}
                      />
                      <div className="space-y-2 text-center">
                        <h2 className="text-3xl font-extrabold">
                          Your Gallery
                        </h2>
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
                  ) : (
                    <div className="grid grid-cols-1 flex-wrap gap-1  sm:grid-cols-2 lg:grid-cols-3">
                      {userData?.posts.map((post) => (
                        <Post key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {inspectedUserData?.posts.length === 0 ? (
                    <div className="flex h-max w-full flex-col items-center justify-center space-y-4 py-6">
                      <Icon
                        name="Camera"
                        className="rounded-full p-3 text-neutral-700 ring ring-inset ring-neutral-600"
                        size="78px"
                        strokeWidth="1"
                        onClick={() => setIsDndUploadModalOpen(true)}
                      />
                      <div className="space-y-2 text-center">
                        <h2 className="text-3xl font-extrabold">
                          No Posts Yet
                        </h2>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 flex-wrap gap-1 sm:grid-cols-2 lg:grid-cols-3">
                      {inspectedUserData?.posts.map((post) => (
                        <Post key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </>
              )} */}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
