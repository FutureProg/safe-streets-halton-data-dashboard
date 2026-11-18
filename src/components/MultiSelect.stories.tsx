import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { expect, userEvent } from "storybook/test";

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

export const SelectAllInTextBox: Story = {
  ...Default,
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox") as HTMLInputElement;
    await userEvent.type(input, "Opt");
    await userEvent.keyboard("{Control>}a{/Control}");
    await expect(input.selectionStart).toBe(0);
    await expect(input.selectionEnd).toBe(input.value.length);
    // Close the popup so the a11y check isn't run against the open list.
    await userEvent.keyboard("{Escape}");
  },
};
