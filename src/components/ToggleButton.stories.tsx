import type { Meta, StoryObj } from '@storybook/react';

import ToggleButton from './ToggleButton';
import TestImage from '@/img/mvc-crash-icon.png';
import TestImage2 from '@/../public/layers-2x.png';

const meta = {
  component: ToggleButton,
} satisfies Meta<typeof ToggleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: TestImage,
    alt: "Test Image",
  }
};

export const TwoIcons: Story = {
  args: {
    icon: {
      toggled: TestImage,
      untoggled: TestImage2,
    },
    alt: "Test Image",
  }
};

export const Text: Story = {
  args: {
    text: "Test Toggle",
    alt: "Test Image",
  }
};