import type { Meta, StoryObj } from '@storybook/react';

import MultiSelect from './MultiSelect';

const meta = {
  component: MultiSelect
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <>
        <label htmlFor='multi-select'>Test</label>
        <Story />
      </>
    )
  ],
  args: {
    id: 'multi-select',
    name: 'multi-select',
    options: [{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }]
  }
};