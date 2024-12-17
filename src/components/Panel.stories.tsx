import type { Meta, StoryObj } from '@storybook/react';

import Panel from './Panel';
import SimpleForm from './SimpleForm';
import FormElement from './FormElement';
import FormLabel from './FormLabel';
import InputText from './InputText';
import TestImage from '@/img/mvc-crash-icon.png';

const meta = {
  component: Panel
} satisfies Meta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <SimpleForm>
        <FormElement>
          <FormLabel icon={{src: TestImage, alt: ""}}>Test Form Label</FormLabel>
          <InputText />
        </FormElement>
      </SimpleForm>
    ]
  }
};