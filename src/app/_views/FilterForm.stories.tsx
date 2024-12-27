import type { Meta, StoryObj } from '@storybook/react';

import FilterForm from './FilterForm';
import { within, expect } from '@storybook/test';

const meta = {
  component: FilterForm,
} satisfies Meta<typeof FilterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth()}-${
      date.getDate() < 10 ? "0" : ""
  }${date.getDate()}`;
};

export const Default: Story = {

  play: ({args, canvasElement, step}) => {
    const canvas = within(canvasElement);
    const cityHiddenInput = canvasElement.querySelector('input[name="city"]');
    expect(cityHiddenInput).toBeInTheDocument();
    expect(cityHiddenInput).toHaveValue(['burlington', 'halton hills', 'milton', 'oakville'].toString());

    const endDateInput = canvasElement.querySelector("[name='endDate']");
    expect(endDateInput).toBeInTheDocument();
    expect(endDateInput).toHaveValue(formatDate(new Date()));
  }

};