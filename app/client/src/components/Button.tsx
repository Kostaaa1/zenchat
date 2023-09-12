import { cva, VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, FC } from "react";
import { cn } from "../utils/utils";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center disabled:opacity-50 font-lg disabled:pointer-events-none rounded-lg text-white active:text-zinc-500",
  {
    variants: {
      variant: {
        default: "",
      },
      buttonColor: {
        default: "bg-neutral-700 hover:bg-opacity-80",
        blue: "bg-[#4582dd] hover:bg-opacity-80",
      },
      size: {
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
