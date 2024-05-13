import { cva, VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, FC } from "react";
import { cn } from "../utils/utils";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "transform-all font-lg font-lg inline-flex w-max items-center justify-center rounded-lg text-white duration-200 active:text-zinc-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
      },
      buttonColor: {
        default: "bg-neutral-700 hover:bg-opacity-80",
        blue: "bg-lightBlue hover:bg-opacity-80",
        white: "bg-white text-black hover:bg-opacity-80",
      },
      size: {
        full: "w-full",
        default: "h-8 p-4",
        sm: "h-9 px-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      buttonColor: "default",
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button: FC<ButtonProps> = ({
  children,
  variant,
  buttonColor,
  size,
  className,
  isLoading,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, buttonColor, size, className }))}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mx-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
