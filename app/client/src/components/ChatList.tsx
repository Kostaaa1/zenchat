import { cn } from "../utils/utils";
import { cva, VariantProps } from "class-variance-authority";
import { FC, ReactElement, ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import Avatar from "./Avatar";

export const listVariants = cva(
  "flex cursor-pointer w-full justify-between px-6 py-2 items-center",
  {
    variants: {
      size: {
        default: "",
        sm: "",
      },
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
  image_url?: string;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  isHoverDisabled?: boolean;
  reduceImgSize?: boolean;
  icon?: ReactNode;
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
  reduceImgSize,
  icon,
  loading,
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
        <Avatar image_url={image_url} size={reduceImgSize ? "md" : "lg"} />
        <div className="ml-4 flex h-full flex-col justify-center">
          <h1 className="font-semibold"> {title} </h1>
          <h4 className="text-sm font-semibold text-neutral-400">
            {subtitle ? subtitle : `No messages with this user. Say Hi! 😁`}
          </h4>
        </div>
      </div>
      {icon ? (
        <motion.div
          initial={{ opacity: 0, x: 20, y: "50%" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
          onClick={onIconClick}
          className="absolute bottom-1/2 right-6 flex translate-y-1/2 items-center rounded-full p-[2px] text-zinc-500 transition-colors duration-300 hover:bg-white hover:bg-opacity-10"
        >
          {icon}
        </motion.div>
      ) : null}
    </div>
  );
};

export default ChatList;
