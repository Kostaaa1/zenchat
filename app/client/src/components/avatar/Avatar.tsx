import { VariantProps, cva } from "class-variance-authority";
import { FC } from "react";
import { cn } from "../../utils/utils";
import { Loader2, User } from "lucide-react";

const avatarVariance = cva(
  "relative flex items-center justify-center text-white overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-7 w-7",
        md: "h-10 w-10",
        lg: "h-14 w-14",
        semiLg: "h-16 w-16",
        semiXl: "h-24 w-24",
        xl: "h-32 w-32",
        xxl: "h-40 w-40",
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
    <div
      className={cn(avatarVariance({ size, className }), "bg-slate-300")}
      onClick={onClick}
    >
      {enableHover && (
        <div className="absolute h-full w-full cursor-pointer bg-black opacity-0 transition-all duration-200 hover:opacity-40"></div>
      )}
      {isLoading && (
        <>
          <div className="absolute h-full w-full cursor-pointer bg-black opacity-40"></div>
          <div className="absolute z-[100] h-full w-full animate-spin">
            <Loader2
              strokeWidth="1.2"
              className="absolute right-1/2 top-1/2 h-12 w-12 -translate-y-1/2 translate-x-1/2 "
            />
          </div>
        </>
      )}
      {!image_url || image_url === "" ? (
        <User fill="white" className="h-full w-full p-2" />
      ) : (
        <img className="h-full w-full" src={image_url} />
      )}
    </div>
  );
};

export default Avatar;
