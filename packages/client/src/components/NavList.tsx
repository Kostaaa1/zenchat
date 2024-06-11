import { cn } from "../utils/utils";
import { cva, VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { FC, ReactElement } from "react";

export const listVariants = cva(
  "relative transition-colors px-[10px] flex active:text-zinc-500 h-[47px] items-center justify-start cursor-pointer w-full rounded-lg",
  {
    variants: {
      variant: {
        default: "max-w-[47px] transition-all duration-200 group",
        list: "active:bg-opacity-10",
      },
      hover: {
        darker:
          "transition-colors duration-100 hover:bg-white hover:bg-opacity-10",
        blank: "",
      },
    },
    defaultVariants: {
      variant: "list",
      hover: "darker",
    },
  },
);

export interface NavListProps extends VariantProps<typeof listVariants> {
  children: ReactElement;
  title?: string;
  head?: string;
  className?: string;
  onClick?: () => void;
}

const NavListItem: FC<NavListProps> = ({
  onClick,
  title,
  head,
  variant,
  hover,
  className,
  children,
  ...props
}) => {
  return (
    <li
      onClick={onClick}
      className={cn(listVariants({ variant, className, hover }))}
      {...props}
    >
      {children}
      {title ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pl-3 text-lg"
        >
          {title}
        </motion.span>
      ) : null}
      {head ? (
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pl-1 text-2xl font-bold md:pl-3 md:text-3xl"
        >
          {head}
        </motion.h1>
      ) : null}
    </li>
  );
};

export default NavListItem;
