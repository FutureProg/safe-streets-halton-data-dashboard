import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import MultiSelect from "./MultiSelect";

const meta = {
  component: MultiSelect,
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Test",
    name: "multi-select",
    options: [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2" },
    ],
  },
};
