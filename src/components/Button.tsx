import { PropsWithChildren } from "react"
import classnames from 'classnames';
import styles from './Button.module.scss';

export enum ButtonVariant {
    Primary = 'primary',
    Secondary = 'secondary',
    Neutral = 'neutral',
    Subtle = 'subtle'
}

export enum ButtonSize {
    Default = 'default',
    Small = 'small'
}

type Props = {
    variant: ButtonVariant;
    size?: ButtonSize;
}

export type ButtonProps = PropsWithChildren<Props>;

export default ({
    variant = ButtonVariant.Subtle,
    size = ButtonSize.Small,
    children = ""
}: ButtonProps) => {
    const variantStyle = () => {
        switch (variant) {
            case ButtonVariant.Primary:
                return styles.variantPrimary;
            case ButtonVariant.Secondary:
                return styles.variantSecondary;
            case ButtonVariant.Neutral:
                return styles.variantNeutral;
            case ButtonVariant.Subtle:
                return styles.variantSubtle;
        }
    };
    const sizeStyle = () => {
        switch(size) {
            case ButtonSize.Default:
                return "";
            case ButtonSize.Small:
                return styles.sizeSmall;
        }
    }

    const classNames = classnames(styles.view, 
        variantStyle(),
        sizeStyle()
    );
    return (
        <button className={classNames}>
            {children}
        </button>
    )
}