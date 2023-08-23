import { Meta, StoryObj } from "@storybook/react";

import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
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

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "md",
    children: "Hello World",
  },
};
