import { VariantProps, cva } from "class-variance-authority";
import { FC, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { cn } from "../utils/utils";

const avatarVariance = cva(
  "flex items-center justify-center overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-7 w-7 p-1",
        md: "h-12 w-12 p-2",
        lg: "h-16 w-16 p-3",
        xl: "h-32 w-32 p-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface AvatarProps extends VariantProps<typeof avatarVariance> {
  image_url?: string;
  className?: string;
}

const Avatar: FC<AvatarProps> = ({ image_url, className, size }) => {
  return (
    <div>
      {!image_url || image_url === "" ? (
        <FaUser
          className={cn(avatarVariance({ size, className }), "bg-[#c24425] ")}
        />
      ) : (
        <div className={cn(avatarVariance({ size, className }), "p-0")}>
          <img src={image_url} />
        </div>
      )}
    </div>
  );
};

export default Avatar;
