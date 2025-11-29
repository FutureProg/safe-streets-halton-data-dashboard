import type { Meta, StoryObj } from "@storybook/nextjs";

import InputText from "./InputText";

const meta = {
  decorators: [
    (Story) => (
      <>
        <label htmlFor="input-text">Test</label>
        <Story />
      </>
    ),
  ],
  component: InputText,
} satisfies Meta<typeof InputText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "input-text",
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    id: "input-text",
    disabled: true,
  },
};
