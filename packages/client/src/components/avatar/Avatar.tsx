import { VariantProps, cva } from "class-variance-authority";
import { FC } from "react";
import { cn } from "../../utils/utils";
import { Loader2, User } from "lucide-react";

const avatarVariance = cva(
  "relative flex cursor-pointer items-center justify-center text-white overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-16 w-16",
        xl: "h-28 w-28",
        xxl: "h-40 w-40",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const paddingSize = {
  sm: "p-1",
  md: "p-2",
  lg: "p-2",
  xl: "p-3",
  xxl: "p-4",
};

export interface AvatarProps extends VariantProps<typeof avatarVariance> {
  image_url?: string | null;
  className?: string;
  isLoading?: boolean;
  enableHover?: boolean;
  onClick?: () => void;
}

const Avatar: FC<AvatarProps> = ({
  image_url,
  className,
  onClick,
  size,
  isLoading,
  enableHover = false,
}) => {
  return (
    <div className="inline-flex cursor-pointer select-none items-center justify-center space-x-2">
      <div
        className={cn(avatarVariance({ size, className }), "bg-neutral-300")}
        onClick={onClick}
      >
        {enableHover && (
          <div className="absolute h-full w-full bg-white opacity-0 transition-all duration-200 hover:opacity-5"></div>
        )}
        {isLoading && (
          <>
            <div className="absolute h-full w-full bg-black opacity-40"></div>
            <div className="absolute z-[100] h-full w-full animate-spin">
              <Loader2
                strokeWidth="1.2"
                className="absolute right-1/2 top-1/2 h-12 w-12 -translate-y-1/2 translate-x-1/2 "
              />
            </div>
          </>
        )}
        {!image_url || image_url === "" ? (
          <User
            fill="white"
            className={cn("h-full w-full", paddingSize[size || "lg"])}
          />
        ) : (
          <img className="h-full w-full" src={image_url} />
        )}
      </div>
    </div>
  );
};

export default Avatar;
