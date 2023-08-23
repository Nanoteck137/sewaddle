import { Meta, StoryObj } from "@storybook/react";

import { cn } from "@/lib/util";
import Button, { buttonVarients } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const PrimarySmall: Story = {
  args: {
    variant: "primary",
    size: "sm",
    children: "Hello World",
  },
};

export const PrimaryMedium: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Hello World",
  },
};

export const PrimaryLarge: Story = {
  args: {
    variant: "primary",
    size: "lg",
    children: "Hello World",
  },
};

export const PrimaryDisabled: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Hello World",
    disabled: true,
  },
};

export const Link: Story = {
  args: {
    className: "inline-block cursor-pointer select-none",
  },
  render: (args) => (
    <a
      className={cn(
        buttonVarients({
          variant: args.variant,
          size: args.size,
          className: args.className,
        }),
      )}
    >
      Button
    </a>
  ),
};
