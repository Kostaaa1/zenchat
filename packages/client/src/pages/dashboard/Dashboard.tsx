import { useLocation, useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { trpc } from "../../lib/trpcClient"
import ErrorPage from "../ErrorPage"
import { FC, useEffect, useState } from "react"
import useUser from "../../hooks/useUser"
import useModalStore from "../../stores/modalStore"
import Icon from "../../components/Icon"
import Post from "./Post"
import useGeneralStore from "../../stores/generalStore"
import { DashboardHeader } from "./DashboardHeader"
import MainContainer from "../../components/MainContainer"
import { loadImage } from "../../utils/image"
import { cn } from "../../utils/utils"

type SeparatorProps = {
  className?: string
}

export const Separator: FC<SeparatorProps> = ({ className }) => {
  return <div className={cn("z-50 h-[2px] w-full bg-[#262626]", className)}></div>
}

const Dashboard = () => {
  const params = useParams<{ username: string }>()
  const { user } = useUser()
  const { openModal } = useModalStore((state) => state.actions)
  const isMobile = useGeneralStore((state) => state.isMobile)
  const location = useLocation()
  const [isDashboardLoading, setIsDashboardLoading] = useState<boolean>(false)
  const { data: inspectedUserData, isFetched } = trpc.user.get.useQuery(
    { data: params.username!, type: "username" },
    {
      enabled: !!user && !!params.username,
      refetchOnMount: "always"
    }
  )

  useEffect(() => {
    return () => {
      setIsDashboardLoading(false)
    }
  }, [location && location.pathname])

  const loadImages = async (urls: string[]) => {
    try {
      await Promise.all(urls.map(async (x) => await loadImage(x)))
      setIsDashboardLoading(true)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!inspectedUserData) return
    const { posts, image_url } = inspectedUserData
    const urls = [...posts.map((x) => x.thumbnail_url ?? x.media_url)]
    if (image_url) urls.push(image_url)
    loadImages(urls)
  }, [inspectedUserData])

  useEffect(() => {
    return () => {
      setIsDashboardLoading(false)
    }
  }, [])

  const openUploadModal = () => {
    if (params.username === user!.username) {
      openModal("uploadpost")
    }
  }

  return (
    <MainContainer>
      <div className={cn("ml-[80px] min-h-full w-full max-w-[1000px] px-4 py-2 lg:ml-[300px]", isMobile ? "ml-0" : "")}>
        {inspectedUserData === null ? (
          <ErrorPage />
        ) : (
          <>
            {isFetched && isDashboardLoading ? (
              <>
                <DashboardHeader username={user?.username} userData={inspectedUserData} />
                <Separator className="mb-8" />
                {inspectedUserData?.posts.length === 0 ? (
                  <div className="flex h-max w-full flex-col items-center justify-center space-y-4 py-6">
                    {user?.username === params.username ? (
                      <>
                        <Icon
                          name="Camera"
                          className="cursor-pointer rounded-full p-3 text-neutral-700 ring ring-inset ring-neutral-600"
                          size="78px"
                          strokeWidth="1"
                          onClick={openUploadModal}
                        />
                        <div className="space-y-2 text-center">
                          <h2 className="text-3xl font-extrabold">Your Gallery</h2>
                          <p>The photos from gallery will appear on your profile.</p>
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
                          <h2 className="text-3xl font-extrabold">No Posts Yet</h2>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <ul className={cn("grid grid-cols-3 gap-1", isMobile && "pb-16")}>
                    {inspectedUserData!.posts.map((post) => (
                      <Post key={post.id} post={post} />
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="mt-10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </MainContainer>
  )
}

export default Dashboard
