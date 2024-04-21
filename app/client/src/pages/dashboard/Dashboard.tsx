import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { trpc } from "../../utils/trpcClient";
import ErrorPage from "../ErrorPage";
import { FC, useEffect, useMemo, useState } from "react";
import { TPost } from "../../../../server/src/types/types";
import useUser from "../../hooks/useUser";
import useModalStore from "../../utils/stores/modalStore";
import { cn, loadImage } from "../../utils/utils";
import Icon from "../main/components/Icon";
import Post from "./Post";
import useGeneralStore from "../../utils/stores/generalStore";
import { DashboardHeader } from "./DashboardHeader";

type SeparatorProps = {
  className?: string;
};

const Separator: FC<SeparatorProps> = ({ className }) => {
  return (
    <div className={cn("z-50 h-[2px] w-full bg-[#262626]", className)}></div>
  );
};

const Dashboard = () => {
  const params = useParams<{ username: string }>();
  const { userData } = useUser();
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  const isSearchActive = useGeneralStore((state) => state.isSearchActive);
  const [postsLoaded, setPostsLoaded] = useState<boolean>(false);
  const username = useGeneralStore((state) => state.username);

  const { data: inspectedUserData, isFetched } = trpc.user.get.useQuery(
    { data: username!, type: "username" },
    {
      enabled: !!userData && !!username && !!params.username,
    },
  );

  const loadImages = async (posts: TPost[]) => {
    await Promise.all(posts.map(async (x) => await loadImage(x.media_url)));
    setPostsLoaded(true);
  };

  useEffect(() => {
    if (!inspectedUserData) return;
    loadImages(inspectedUserData.posts);
  }, [inspectedUserData]);

  useEffect(() => {
    return () => {
      setPostsLoaded(false);
    };
  }, [isFetched]);

  return (
    <div
      className={cn(
        "min-h-full w-full max-w-[1000px] px-4 py-2",
        isSearchActive && !isResponsive ? "ml-[300px]" : "ml-[80px]",
      )}
    >
      {inspectedUserData === null ? (
        <ErrorPage />
      ) : (
        <>
          {!isFetched || !postsLoaded ? (
            <div className="mt-10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          ) : (
            <>
              <DashboardHeader
                username={userData?.username}
                userData={inspectedUserData}
              />
              <Separator className="mb-8" />
              {inspectedUserData?.posts.length === 0 ? (
                <div className="flex h-max w-full flex-col items-center justify-center space-y-4 py-6">
                  {userData?.username === params.username ? (
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
