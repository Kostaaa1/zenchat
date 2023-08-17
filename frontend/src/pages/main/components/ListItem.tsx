import { cn } from "../../../utils/utils";
import { cva, VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { FC, ReactElement } from "react";
import useStore from "../../../utils/store";

export const listVariants = cva(
  "relative transition-colors px-[10px] flex active:text-zinc-500 h-[48px] items-center cursor-pointer rounded-lg",
  {
    variants: {
      variant: {
        default:
          "group active:ring max-w-[48px] w-[48px] active:ring-white active:ring-1 transition-all duration-200",
        list: "group w-full active:bg-opacity-5",
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
