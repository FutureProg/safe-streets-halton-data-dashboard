import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button, { ButtonSize, ButtonVariant } from "./Button";
import { InputType } from "storybook/internal/types";

const argTypeFromEnum = (enumType: object): InputType => ({
  options: Object.values(enumType),
  control: {
    type: "select",
  },
});

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/LFm8nDtTmvSWZdJK3GtxRK/Safe-Streets-Dashboard?node-id=2011-552&t=6jObnkF3fr9QAHst-4",
    },
    layout: "centered",
  },
  argTypes: {
    size: argTypeFromEnum(ButtonSize),
    variant: argTypeFromEnum(ButtonVariant),
  },
};

export default meta;

type Story = StoryObj<typeof Button>;
export const Primary: Story = {
  parameters: {},
  args: {
    children: "Button Text",
    size: ButtonSize.Default,
    variant: ButtonVariant.Primary,
  },
};

export const Neutral: Story = {
  args: {
    children: "Button Text",
    size: ButtonSize.Default,
    variant: ButtonVariant.Neutral,
  },

  parameters: {},
};

export const Secondary: Story = {
  args: {
    children: "Button Text",
    size: ButtonSize.Default,
    variant: ButtonVariant.Secondary,
  },

  parameters: {},
};

export const Subtle: Story = {
  args: {
    children: "Button Text",
    size: ButtonSize.Default,
    variant: ButtonVariant.Subtle,
  },

  parameters: {},
};
