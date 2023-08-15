import { ComponentProps, ComponentType, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  title: string;
  icon: ComponentType;
  selected?: boolean;
} & ComponentProps<"button">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { title, icon: Icon, selected, className, ...buttonProps } = props;

    return (
      <button
        ref={ref}
        className={twMerge(
          `flex items-center rounded border-b-2 border-gray-100 p-2 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 lg:max-xl:flex-col lg:max-xl:border-none lg:max-xl:shadow-none ${
            selected ? "bg-gray-100 dark:bg-gray-600" : ""
          }`,
          className,
        )}
        {...buttonProps}
      >
        <div className="flex h-9 w-9 items-center justify-center lg:max-xl:h-8 lg:max-xl:w-8">
          <Icon />
        </div>
        <div className="w-5" />
        <p className="text-base">{title}</p>
      </button>
    );
  },
);
