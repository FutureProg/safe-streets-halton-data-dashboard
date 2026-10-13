import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FilterForm from "./FilterForm";
import { expect } from "storybook/test";
import { formatDateHtmlInput } from "@/util";
import { StaticValuesProvider } from "../StaticValuesContext";

const meta = {
  component: FilterForm,
} satisfies Meta<typeof FilterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

const cities = [
  { label: "Burlington", value: "burlington" },
  { label: "Halton Hills", value: "halton hills" },
];

export const Default: Story = {
  decorators: [
    (Story) => {
      return (
        <StaticValuesProvider staticValues={{ incidentTypes: [], cities }}>
          <Story />
        </StaticValuesProvider>
      );
    },
  ],

  play: async ({ canvasElement }) => {
    const cityHiddenInput = canvasElement.querySelector('input[name="city"]');
    await expect(cityHiddenInput).toBeInTheDocument();
    await expect(cityHiddenInput).toHaveValue(
      ["burlington", "halton hills"].toString(),
    );

    const endDateInput = canvasElement.querySelector("[name='endDate']");
    await expect(endDateInput).toBeInTheDocument();
    await expect(endDateInput).toHaveValue(formatDateHtmlInput(new Date()));
  },
};
