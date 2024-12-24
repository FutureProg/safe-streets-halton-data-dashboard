import type { Meta, StoryObj } from '@storybook/react';

import MenuPanel from './MenuPanel';

const meta = {
  component: MenuPanel,
} satisfies Meta<typeof MenuPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};