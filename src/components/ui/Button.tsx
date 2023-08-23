import { cn } from "@/lib/util";
import { VariantProps, cva } from "class-variance-authority";
import { ComponentPropsWithRef, PropsWithChildren } from "react";

export const buttonVarients = cva(
  "flex justify-center items-center gap-2 rounded shadow hover:shadow-md transition-all duration-200 active:scale-95 active:shadow",
  {
    variants: {
      variant: {
        primary:
          "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none",
        secondary: "bg-red-300 hover:bg-red-200",
      },
      size: {
        sm: "px-2 py-1 text-sm",
        md: "px-6 py-2 text-base",
        lg: "px-10 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends ComponentPropsWithRef<"button">,
    PropsWithChildren,
    VariantProps<typeof buttonVarients> {}

const Button = (props: ButtonProps) => {
  const { variant, size, className, ...other } = props;

  const classes = buttonVarients({ variant, size, className });

  return (
    <button {...other} className={cn(classes)}>
      {props.children}
    </button>
  );
};

export default Button;
