import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FilterForm, { useFilterFormValues } from "./FilterForm";
import { expect } from "storybook/test";
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

const FilterFormWithState = () => {
  const [values, setValues] = useFilterFormValues();
  return <FilterForm values={values} onValuesChange={setValues} />;
};

export const Default: Story = {
  args: {
    values: undefined as never,
    onValuesChange: () => {},
  },
  render: () => (
    <StaticValuesProvider staticValues={{ incidentTypes: [], cities }}>
      <FilterFormWithState />
    </StaticValuesProvider>
  ),

  play: async ({ canvasElement }) => {
    const cityHiddenInput = canvasElement.querySelector('input[name="city"]');
    await expect(cityHiddenInput).toBeInTheDocument();
    await expect(cityHiddenInput).toHaveValue(
      ["burlington", "halton hills"].toString(),
    );

    const endDateInput = canvasElement.querySelector("[name='endDate']");
    await expect(endDateInput).toBeInTheDocument();
  },
};
