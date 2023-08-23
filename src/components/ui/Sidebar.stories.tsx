import { StarIcon } from "@heroicons/react/24/solid";
import { Meta, StoryObj } from "@storybook/react";

import { Button } from "../sidebar/Button";

const meta = {
  title: "Wot/Sidebar",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    icon: <StarIcon className="w-10 h-10" />,
    title: "Test",
  },
};
