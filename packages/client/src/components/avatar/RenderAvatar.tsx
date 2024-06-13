import { FC } from "react";
import Avatar from "./Avatar";
import { cn } from "../../utils/utils";

interface RenderAvatarProps {
  image_urls: {
    image_url_1: string | null | undefined;
    image_url_2?: string | null | undefined;
  };
  avatarSize: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  className?: string;
}

const RenderAvatar: FC<RenderAvatarProps> = ({
  image_urls,
  avatarSize,
  isOnline,
  className,
}) => {
  const { image_url_1, image_url_2 } = image_urls;
  const hasImg2 = image_url_2 === undefined;
  return (
    <div
      className={cn(
        "relative flex h-full",
        !hasImg2 && "mb-4",
        !hasImg2 && avatarSize == "md" && "scale-[0.8]",
        !hasImg2 && avatarSize == "xl" && "scale-[2]",
        className,
      )}
    >
      {!hasImg2 ? (
        <>
          <Avatar image_url={image_url_1} />
          <Avatar
            image_url={image_url_2}
            className="-ml-8 mt-6 outline outline-1 outline-black"
          />
        </>
      ) : (
        <Avatar image_url={image_url_1} size={avatarSize} />
      )}
      {hasImg2 && isOnline && (
        <div className="absolute bottom-[6px] right-[2px] h-[10px] w-[10px] rounded-full bg-green-500 outline outline-black"></div>
      )}
    </div>
  );
};

export default RenderAvatar;
