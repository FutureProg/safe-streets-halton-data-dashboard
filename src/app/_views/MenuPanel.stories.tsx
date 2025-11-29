import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MenuPanel from './MenuPanel';

const meta = {
  component: MenuPanel,
} satisfies Meta<typeof MenuPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};