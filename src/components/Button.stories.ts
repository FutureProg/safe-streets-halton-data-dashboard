import type {Meta, StoryObj} from '@storybook/react';

import Button, { ButtonSize, ButtonVariant } from './Button';

const meta: Meta<typeof Button> = {
    component: Button,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/LFm8nDtTmvSWZdJK3GtxRK/Safe-Streets-Dashboard?node-id=2011-552&t=6jObnkF3fr9QAHst-4'
        },
        layout: 'centered'
    },
    argTypes: {
        size: {
            options: ButtonSize,
            control: {
                type: 'select',
                labels: Object.keys(ButtonVariant)
            }
        },
        variant: {
            options: ButtonVariant,
            control: {
                type: 'select',
                labels: Object.keys(ButtonVariant)
            }
        }
    }
}

export default meta;

type Story = StoryObj<typeof Button>;
export const Primary : Story = {
    parameters: {
    },
    args: {
        children: "Button Text",
        size: "default",
        variant: ButtonVariant.Primary
    }
}

export const Neutral: Story = {
    args: {
        children: "Button Text",
        size: "default",
        variant: "neutral"
    },

    parameters: {}
};

export const Secondary: Story = {
    args: {
        children: "Button Text",
        size: "default",
        variant: "secondary"
    },

    parameters: {}
};

export const Subtle: Story = {
    args: {
        children: "Button Text",
        size: "default",
        variant: "subtle"
    },

    parameters: {}
};
