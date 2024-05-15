import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { trpc } from "../../utils/trpcClient";
import ErrorPage from "../ErrorPage";
import { FC, useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import useModalStore from "../../utils/state/modalStore";
import { cn, loadImage } from "../../utils/utils";
import Icon from "../../components/Icon";
import Post from "./Post";
import useGeneralStore from "../../utils/state/generalStore";
import { DashboardHeader } from "./DashboardHeader";
import MainContainer from "../../components/MainContainer";
import axios from "axios";

type SeparatorProps = {
  className?: string;
};

export const Separator: FC<SeparatorProps> = ({ className }) => {
  return (
    <div className={cn("z-50 h-[2px] w-full bg-[#262626]", className)}></div>
  );
};

const Dashboard = () => {
  const params = useParams<{ username: string }>();
  const { userData } = useUser();
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);
  const [postsLoaded, setPostsLoaded] = useState<boolean>(false);
  const username = useGeneralStore((state) => state.username);
  const isMobile = useGeneralStore((state) => state.isMobile);
  const { data: inspectedUserData, isFetched } = trpc.user.get.useQuery(
    { data: params.username!, type: "username" },
    {
      enabled: !!userData && !!username && !!params.username,
    },
  );

  const loadImages = async (urls: string[]) => {
    try {
      await Promise.all(
        urls.map(async (x) => x.length > 0 && (await loadImage(x))),
      );
      setPostsLoaded(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!inspectedUserData || !inspectedUserData.image_url) {
      setPostsLoaded(true);
      return;
    }
    loadImages([
      inspectedUserData!.image_url,
      ...inspectedUserData.posts.map((x) => x.thumbnail_url ?? x.media_url),
    ]);
  }, [inspectedUserData]);

  useEffect(() => {
    return () => {
      setPostsLoaded(false);
    };
  }, [isFetched]);

  const openUploadModal = () => {
    if (params.username === userData!.username) {
      setIsDndUploadModalOpen(true);
    }
  };

  return (
    <MainContainer>
      <div
        className={cn(
          "ml-[80px] min-h-full w-full max-w-[1000px] px-4 py-2 lg:ml-[300px]",
          isMobile ? "ml-0" : "",
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
                          className="cursor-pointer rounded-full p-3 text-neutral-700 ring ring-inset ring-neutral-600"
                          size="78px"
                          strokeWidth="1"
                          onClick={openUploadModal}
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
                            onClick={openUploadModal}
                          >
                            Upload the photo
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Icon
                          name="Camera"
                          className="cursor-default rounded-full p-3 text-neutral-700 ring ring-inset ring-neutral-600"
                          size="78px"
                          strokeWidth="1"
                          onClick={openUploadModal}
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
                  // <div className="grid grid-cols-1 flex-wrap gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  <ul className="grid grid-cols-3 gap-1">
                    {inspectedUserData!.posts.map((post) => (
                      <Post key={post.id} post={post} />
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </div>
    </MainContainer>
  );
};

export default Dashboard;
