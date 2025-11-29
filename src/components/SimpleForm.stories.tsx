import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SimpleForm from './SimpleForm';
import InputText from './InputText';
import FormLabel from './FormLabel';

import TestImage from '@/img/mvc-crash-icon.png';
import FormElement from './FormElement';

const meta = {
  component: SimpleForm,
} satisfies Meta<typeof SimpleForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <FormElement>
        <FormLabel htmlFor='test' icon={{src: TestImage, alt: ""}}>Test Form Label</FormLabel>
        <InputText id='test' />
      </FormElement>
    ],
    buttonText: undefined
  }
};