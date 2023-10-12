import { FC, useEffect, useState } from "react";
import Avatar from "./Avatar";

interface RenderAvatarProps {
  image_url_1: string;
  image_url_2: string;
  avatarSize: "xl" | "lg" | "sm" | "md";
}

const RenderAvatar: FC<RenderAvatarProps> = ({
  image_url_1,
  image_url_2,
  avatarSize,
}) => {
  return (
    <div>
      {image_url_2 === undefined ? (
        <Avatar image_url={image_url_1} size={avatarSize} />
      ) : (
        <div className="relative flex h-16 w-16">
          <Avatar
            image_url={image_url_1}
            className="absolute left-0 top-0"
            size={avatarSize}
          />
          <Avatar
            image_url={image_url_2}
            className="absolute left-4 top-4 outline outline-1 outline-neutral-700"
            size={avatarSize}
          />
        </div>
      )}
    </div>
  );
};

export default RenderAvatar;
