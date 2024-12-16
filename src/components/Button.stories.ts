import type {ArgTypes, Meta, StoryObj} from '@storybook/react';

import Button, { ButtonSize, ButtonVariant } from './Button';
import { InputType } from 'storybook/internal/types';

const argTypeFromEnum = <T extends object>(enumType: T, description='undefined') : InputType => {
    const options = Object.keys(typeof enumType)
        .filter((key) => !isNaN(parseInt(key)));
    
    return {
        options: enumType,
        control: {
            type: 'select'
        }
    }
}

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
        size: argTypeFromEnum(ButtonSize),
        variant: argTypeFromEnum(ButtonVariant)
    }
}

export default meta;

type Story = StoryObj<typeof Button>;
export const Primary : Story = {
    parameters: {
    },
    args: {
        children: "Button Text",
        size: "default" as ButtonSize,
        variant: "primary" as ButtonVariant
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
