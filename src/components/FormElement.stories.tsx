import type { Meta, StoryObj } from '@storybook/react';

import FormElement from './FormElement';
import FormLabel from './FormLabel';
import InputText from './InputText';
import TestImage from '@/img/mvc-crash-icon.png';
import MultiSelect from './MultiSelect';

const meta = {
  component: FormElement,
} satisfies Meta<typeof FormElement>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TextInputForm: Story = {
  args: {
    children: [
      <FormLabel htmlFor='test' icon={{src: TestImage, alt: ""}}>Test Form Label</FormLabel>,
      <InputText id='test' />
    ]
  }
};

export const MultiSelectForm: Story = {
  args: {
    children: [
      <FormLabel htmlFor='test' icon={{src: TestImage, alt: ""}}>Test Form Label</FormLabel>,
      <MultiSelect id='test' options={[{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }]} />
    ]
  }
}