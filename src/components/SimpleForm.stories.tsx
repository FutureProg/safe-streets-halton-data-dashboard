import type { Meta, StoryObj } from '@storybook/react';

import SimpleForm from './SimpleForm';
import InputText from './InputText';
import FormLabel from './FormLabel';

import TestImage from '@/img/mvc-crash-icon.png';

const meta = {
  component: SimpleForm,
} satisfies Meta<typeof SimpleForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <FormLabel icon={{src: TestImage, alt: ""}}>Test Form Label</FormLabel>,
      <InputText />
    ],
    buttonText: undefined
  }
};