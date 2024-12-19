import type { Meta, StoryObj } from '@storybook/react';

import MultiSelect from './MultiSelect';

const meta = {
  component: MultiSelect,
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }]
  }
};