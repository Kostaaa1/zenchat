import { VariantProps, cva } from "class-variance-authority";
import { FC } from "react";
import { FaUser } from "react-icons/fa";
import { cn } from "../../utils/utils";

const avatarVariance = cva(
  "flex items-center justify-center text-white overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-7 w-7 p-1",
        md: "h-10 w-10 p-2",
        lg: "h-14 w-14 p-3",
        semiLg: "h-16 w-16 p-3",
        semiXl: "h-24 w-24 p-4",
        xl: "h-32 w-32 p-4",
        xxl: "h-40 w-40 p-4",
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
    <>
      {!image_url || image_url === "" ? (
        <div>
          <FaUser
            className={cn(avatarVariance({ size, className }), "bg-slate-300")}
          />
        </div>
      ) : (
        <div className={cn(avatarVariance({ size, className }), "p-0")}>
          <img className="h-" src={image_url} />
        </div>
      )}
    </>
  );
};

export default Avatar;
