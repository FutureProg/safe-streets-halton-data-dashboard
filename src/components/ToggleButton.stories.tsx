import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import ToggleButton from './ToggleButton';
import TestImage from '@/img/icon-city.svg';
import TestImage2 from '@/img/icon-lookup.svg';

const meta = {
  component: ToggleButton,
} satisfies Meta<typeof ToggleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: TestImage,
    alt: "Test Image",
    onToggle: fn()
  },
  play: async ({args, canvasElement, step}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('button')).toHaveAttribute('data-toggled', 'false');
    await step('Click', async () => {
      await userEvent.click(canvas.getByRole('button'));
    });
    expect(args.onToggle).toHaveBeenCalledOnce();
    expect(canvas.getByRole('button')).toHaveAttribute('data-toggled', 'true');
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