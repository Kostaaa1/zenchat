import { cn } from "../utils/utils";
import { cva, VariantProps } from "class-variance-authority";
import { FC, ReactElement, ReactNode, useState } from "react";
import { motion } from "framer-motion";
import Avatar from "./avatar/Avatar";
import RenderAvatar from "./avatar/RenderAvatar";

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
  children?: ReactElement;
  title?: string;
  subtitle?: string;
  image_url?: string | string[];
  className?: string;
  onClick?: () => void;
  isHoverDisabled?: boolean;
  icon?: ReactNode;
  avatarSize: "sm" | "md" | "lg" | "xl";
  onIconClick?: () => void;
}

const ChatList: FC<ListProps> = ({
  onClick,
  onIconClick,
  title,
  subtitle,
  image_url,
  hover,
  className,
  children,
  isHoverDisabled,
  avatarSize,
  icon,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleHoverList = () => {
    if (isHoverDisabled) return;
    setIsHovered(!isHovered);
  };

  return (
    <div
      onMouseEnter={handleHoverList}
      onMouseLeave={handleHoverList}
      className={cn(
        icon ? "relative" : null,
        listVariants({ className, hover }),
      )}
      {...props}
    >
      <div className={cn("flex w-full items-center")} onClick={onClick}>
        {children}
        <RenderAvatar
          image_urls={{
            image_url_1: image_url?.[0] as string,
            image_url_2: image_url?.[1],
          }}
          avatarSize="lg"
        />
        <div className="ml-4 flex h-full flex-col items-start">
          <h1 className="font-semibold"> {title} </h1>
          <h4 className="text-sm font-semibold text-neutral-400">
            {subtitle || null}
          </h4>
        </div>
      </div>
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
    </div>
  );
};

export default ChatList;
