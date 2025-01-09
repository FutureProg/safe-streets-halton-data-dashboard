import type { Meta, StoryObj } from '@storybook/react';

import FilterForm from './FilterForm';
import { within, expect } from '@storybook/test';
import { formatDateHtmlInput } from '@/util';
import { StaticValuesProvider } from '../StaticValuesContext';
import { HTMLInputOption } from '../common';

const meta = {
  component: FilterForm,
} satisfies Meta<typeof FilterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

const cities = [
  {label: 'Burlington', value: 'burlington'},
  {label: 'Halton Hills', value: 'halton hills'}
];

export const Default: Story = {

  decorators: [ (Story) => {
    return (
      <StaticValuesProvider staticValues={{incidentTypes: [], cities}}>
        <Story/>
      </StaticValuesProvider>
    )
  }],

  play: ({args, canvasElement, step}) => {
    const canvas = within(canvasElement);
    const cityHiddenInput = canvasElement.querySelector('input[name="city"]');
    expect(cityHiddenInput).toBeInTheDocument();
    expect(cityHiddenInput).toHaveValue(['burlington', 'halton hills'].toString());

    const endDateInput = canvasElement.querySelector("[name='endDate']");
    expect(endDateInput).toBeInTheDocument();
    expect(endDateInput).toHaveValue(formatDateHtmlInput(new Date()));
  }

};