import { StarIcon } from "@heroicons/react/24/solid";
import { Meta, StoryObj } from "@storybook/react";

import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    test: true,
    children: "Hello World",
  },
};

const Test = () => {
  return (
    <div className="flex items-center gap-2">
      <StarIcon className="w-5 h-5" />
      <span>Hello World</span>
    </div>
  );
};

export const CustomChildren: Story = {
  args: {
    test: false,
    children: <Test />,
  },
};
