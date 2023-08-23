import { PropsWithChildren } from "react";

interface ButtonProps {
  test?: boolean;
}

const Button = (props: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      className={`px-4 py-1 rounded ${
        props.test ? "bg-blue-300" : "bg-red-300"
      }`}
    >
      {props.children}
    </button>
  );
};

export default Button;
