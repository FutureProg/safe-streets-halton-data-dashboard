import type { Meta, StoryObj } from '@storybook/react';

import FormElement from './FormElement';
import FormLabel from './FormLabel';
import InputText from './InputText';
import TestImage from '@/img/mvc-crash-icon.png';

const meta = {
  component: FormElement,
} satisfies Meta<typeof FormElement>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <FormLabel icon={{src: TestImage, alt: ""}}>Test Form Label</FormLabel>,
      <InputText />
    ]
  }
};