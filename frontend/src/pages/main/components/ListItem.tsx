import { cn } from "../../../utils";
import { cva, VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { FC, ReactElement } from "react";

export const listVariants = cva(
  "relative px-2 transition-colors flex active:text-zinc-500 h-[52px] items-center cursor-pointer rounded-lg",
  {
    variants: {
      variant: {
        default:
          "group active:ring active:ring-white active:ring-1 w-[44px] transition-all duration-200",
        list: "group active:bg-opacity-5 justify-start",
      },
      hover: {
        darker: "hover:bg-white hover:bg-opacity-10",
        blank: "",
      },
    },
    defaultVariants: {
      variant: "list",
      hover: "darker",
    },
  }
);

export interface ListProps extends VariantProps<typeof listVariants> {
  children: ReactElement;
  title?: string;
  head?: string;
  className?: string;
  onClick?: () => void;
}

const ListItem: FC<ListProps> = ({
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
          className="ml-3 text-lg"
        >
          {title}
        </motion.span>
      ) : null}
      {head ? (
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-3 text-2xl font-bold"
        >
          {head}
        </motion.h1>
      ) : null}
    </li>
  );
};

export default ListItem;
