import type {Meta, StoryObj} from '@storybook/react';

import Button from './Button';

const meta: Meta<typeof Button> = {
    component: Button,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/LFm8nDtTmvSWZdJK3GtxRK/Safe-Streets-Dashboard?node-id=2011-552&t=6jObnkF3fr9QAHst-4'
        }
    }
}

export default meta;

type Story = StoryObj<typeof Button>;
export const Default : Story = {
    parameters: {
        
    }
}
