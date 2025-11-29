import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FormLabel from './FormLabel';

const meta = {
  component: FormLabel,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    icon: {
      mapping: {
        src: 'StaticImageData',
        alt: 'string'
      },
      description: 'The static image data',
      type: {
        name: 'object',
        value: {
          src: {name: 'other', value: 'StaticImageData'},
          alt: {name: 'string'}
        }
      }
    }
  },
} satisfies Meta<typeof FormLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Hello"
  }
};

export const WithIcon: Story = {
  args: {
    children: "Hello",

    icon: {
      "src": {
        "src": "/layers.png",
        "height": 82,
        "width": 50,
        "blurDataURL": "/layers.png"
      },

      "alt": ""
    }
  }
};