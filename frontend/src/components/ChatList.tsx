import { cn } from "../utils/utils";
import { cva, VariantProps } from "class-variance-authority";
import { FC, ReactElement, useState } from "react";
import Icon from "../pages/main/components/Icon";
import { motion } from "framer-motion";

export const listVariants = cva(
  "relative flex cursor-pointer w-full justify-between px-6 py-2 items-center",
  {
    variants: {
      hover: {
        darker: "hover:bg-white hover:bg-opacity-10",
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
}

const ChatList: FC<ListProps> = ({
  onClick,
  title,
  subtitle,
  image_url,
  hover,
  className,
  children,
  isHoverDisabled,
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
      onClick={onClick}
      className={cn(listVariants({ className, hover }))}
      {...props}
    >
      <div className="flex h-16 w-full">
        {children}
        <img
          src={image_url}
          className="mr-4 h-16 w-16 rounded-full"
          alt="user-image"
        />
        <div className="flex h-full w-full flex-col justify-between py-[6px]">
          <h1 className="text-lg font-semibold"> {title} </h1>
          <p className="text-sm text-neutral-400">
            {subtitle ? subtitle : "No messages with this user. Say Hi! 😁"}
          </p>
        </div>
      </div>
      {isHovered ? (
        <motion.div
          initial={{ opacity: 0, x: 20, y: "50%" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
          className="absolute bottom-1/2 right-6 flex translate-y-1/2 items-center rounded-full p-[2px] text-zinc-500 transition-colors duration-300 hover:bg-white hover:bg-opacity-10"
        >
          <Icon name="Plus" size="28px" />
        </motion.div>
      ) : null}
    </div>
  );
};

export default ChatList;
