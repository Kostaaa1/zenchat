import { FC, useEffect } from "react";
import Avatar from "./Avatar";
import { cn } from "../../utils/utils";

interface RenderAvatarProps {
  image_urls: {
    image_url_1: string;
    image_url_2?: string;
  };
  avatarSize: "sm" | "md" | "lg" | "xl";
}

const RenderAvatar: FC<RenderAvatarProps> = ({ image_urls, avatarSize }) => {
  const { image_url_1, image_url_2 } = image_urls;

  return (
    <div className="flex h-full">
      {image_url_2 === undefined ? (
        <Avatar image_url={image_url_1} size={avatarSize} />
      ) : (
        <div
          className={cn(
            "relative h-16 w-16",
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
    </div>
  );
};

export default RenderAvatar;
