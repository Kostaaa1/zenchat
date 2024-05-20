import { cn } from "../utils/utils";
import { cva, VariantProps } from "class-variance-authority";
import { FC, ReactElement, ReactNode, useState } from "react";
import RenderAvatar from "./avatar/RenderAvatar";
import { motion } from "framer-motion";

export const listVariants = cva(
  "flex cursor-pointer w-full justify-between px-6 py-2 items-center",
  {
    variants: {
      hover: {
        darker:
          "transition-colors duration-100 hover:bg-white hover:bg-opacity-10",
        blank: "",
      },
    },
    defaultVariants: {
      hover: "darker",
    },
  },
);

export interface ListProps extends VariantProps<typeof listVariants> {
  // image_url?: string | string[];
  children?: ReactElement;
  title?: string;
  subtitle?: string | null;
  image_url?: (string | null | undefined)[];
  className?: string;
  onClick?: () => void;
  isHoverDisabled?: boolean;
  icon?: ReactNode;
  isRead?: boolean;
  isLoading?: boolean;
  showAvatar?: boolean;
  isActive?: boolean;
  onIconClick?: () => void;
}

const List: FC<ListProps> = ({
  onClick,
  onIconClick,
  title,
  subtitle,
  image_url,
  hover,
  className,
  children,
  isHoverDisabled,
  icon,
  isActive = false,
  isRead = true,
  showAvatar = true,
  isLoading = false,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const handleHoverList = () => {
    if (isHoverDisabled) return;
    setIsHovered(!isHovered);
  };

  return (
    <li
      onMouseEnter={handleHoverList}
      onMouseLeave={handleHoverList}
      className={cn(
        icon ? "relative" : null,
        listVariants({ className, hover }),
      )}
      {...props}
    >
      {!isLoading ? (
        <div
          className={cn("flex w-full items-center space-x-3")}
          onClick={onClick}
        >
          {children}
          {showAvatar && (
            <RenderAvatar
              avatarSize="lg"
              isActive={isActive}
              image_urls={{
                image_url_1: image_url?.[0],
                image_url_2: image_url?.[1],
              }}
            />
          )}
          <div className="flex w-full flex-col text-start">
            <h1> {title} </h1>
            <h4
              className={cn(
                "text-sm font-semibold",
                isRead ? "text-neutral-400" : "text-white",
              )}
            >
              {subtitle}
            </h4>
          </div>
        </div>
      ) : (
        <div className="flex h-14 w-full animate-pulse items-center space-x-2">
          <div className="h-full w-14 overflow-hidden rounded-full bg-neutral-800"></div>
          <div className="flex h-full w-2/3 flex-col justify-center">
            <div className="mb-2 h-4 w-full rounded-lg bg-neutral-800"></div>
            <div className="h-4 w-[80px] rounded-lg bg-neutral-800"></div>
          </div>
        </div>
      )}
      {icon ? (
        <motion.div
          initial={{ opacity: 0, x: 20, y: "50%" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
          onClick={onIconClick}
          className="absolute bottom-1/2 right-6 flex translate-y-1/2 items-center rounded-full p-[2px] text-zinc-500 transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
        >
          {icon}
        </motion.div>
      ) : null}
    </li>
  );
};

export default List;
