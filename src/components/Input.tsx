import { ComponentPropsWithRef, forwardRef, useId } from "react";

type InputProps = {
  type: "text" | "password";
  error?: string;
} & ComponentPropsWithRef<"input">;

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { type, error, placeholder, ...inputProps } = props;

  const id = useId();

  const hasError = !!error;

  return (
    <div className="relative">
      <input
        {...inputProps}
        ref={ref}
        className={`peer h-10 w-full cursor-text border-0 border-b-2 bg-transparent p-0 placeholder-transparent transition-colors focus:ring-0 ${
          hasError
            ? "border-red-400 focus:border-red-400"
            : "focus:border-blue-400"
        }`}
        placeholder={placeholder}
        type={type}
        id={id}
      />
      <label
        className={`absolute -top-4 left-0 cursor-text text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base  peer-focus:-top-4 peer-focus:text-sm ${
          hasError
            ? "text-red-400 peer-placeholder-shown:text-red-400 peer-focus:text-red-400"
            : "peer-placeholder-shown:text-gray-300 peer-focus:text-blue-400"
        }`}
        htmlFor={id}
      >
        {placeholder}
      </label>
      {hasError && <p className="py-2 text-red-400">{error}</p>}
    </div>
  );
});

export default Input;
