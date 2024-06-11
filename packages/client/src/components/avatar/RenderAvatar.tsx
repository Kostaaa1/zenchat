import { FC } from "react";
import Avatar from "./Avatar";
import { cn } from "../../utils/utils";

interface RenderAvatarProps {
  image_urls: {
    image_url_1: string | null | undefined;
    image_url_2?: string | null | undefined;
  };
  avatarSize: "sm" | "md" | "lg" | "xl";
  isActive?: boolean;
  className?: string;
}

const RenderAvatar: FC<RenderAvatarProps> = ({
  image_urls,
  avatarSize,
  isActive,
  className,
}) => {
  const { image_url_1, image_url_2 } = image_urls;
  const hasImage2 = image_url_2 === undefined;
  return (
    <div className={cn("relative flex h-full", className)}>
      {hasImage2 ? (
        <Avatar image_url={image_url_1} size={avatarSize} />
      ) : (
        <div
          className={cn(
            "relative h-14 w-14",
            avatarSize === "md"
              ? "-m-3 scale-75"
              : avatarSize === "xl"
              ? "my-8 scale-[2]"
              : "",
          )}
        >
          <Avatar image_url={image_url_1} className="absolute left-0 top-0" />
          <Avatar
            image_url={image_url_2}
            className="absolute left-4 top-4 outline outline-1 outline-black"
          />
        </div>
      )}
      {hasImage2 && isActive && (
        <div className="absolute bottom-[6px] right-[2px] h-[10px] w-[10px] rounded-full bg-green-500 outline outline-black"></div>
      )}
    </div>
  );
};

export default RenderAvatar;
