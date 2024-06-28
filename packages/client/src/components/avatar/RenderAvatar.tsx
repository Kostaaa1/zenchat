import { FC } from "react"
import Avatar from "./Avatar"
import { cn } from "../../utils/utils"

interface RenderAvatarProps {
  image_url: string | null | undefined
  image_url_2?: string | null | undefined
  avatarSize: "sm" | "md" | "lg" | "xl"
  isOnline?: boolean
  className?: string
}

const RenderAvatar: FC<RenderAvatarProps> = ({ image_url, image_url_2, avatarSize, isOnline, className }) => {
  const spacings = {
    sm: "",
    md: "-ml-7 mt-6",
    lg: "",
    xl: "-ml-[70px] top-8"
  }

  return (
    <div className={cn("relative flex h-full", className)}>
      {image_url_2 ? (
        <>
          <Avatar image_url={image_url} size={avatarSize} />
          <Avatar
            image_url={image_url_2}
            className={cn("outline outline-1 outline-black", spacings[avatarSize])}
            size={avatarSize}
          />
        </>
      ) : (
        <Avatar image_url={image_url} size={avatarSize} />
      )}
      {!image_url_2 && isOnline && (
        <div className="absolute bottom-[6px] right-[2px] h-[10px] w-[10px] rounded-full bg-green-500 outline outline-black"></div>
      )}
    </div>
  )
}

export default RenderAvatar
