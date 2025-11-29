import classNames from "classnames";
import Image, { StaticImageData } from "next/image";
import React, { AriaAttributes, AriaRole, MouseEventHandler, ReactElement, useState } from "react";
import styles from './ToggleButton.module.scss';

export type ToggleButtonProps = {
    onToggle?: (isToggled: boolean) => void;
    defaultToggled?: boolean;
    name?: string;
    id?: string;
    text?: string;
    icon?: StaticImageData | ToggleIconOptions | React.ReactElement<any>;
    className?: string;
    alt?: string;
    style?: React.CSSProperties;
    role?: AriaRole;
} & AriaAttributes;

export type ToggleIconOptions = {
    toggled: StaticImageData | React.ReactElement<typeof Image>;
    untoggled: StaticImageData | React.ReactElement<typeof Image>;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
    onToggle,
    defaultToggled = false,
    text,
    name,
    id,
    icon,
    alt: iconAlt,
    className,
    ...props
}) => {
    const [isToggled, setIsToggled] = useState(defaultToggled);

    const toggle: MouseEventHandler<HTMLButtonElement> = () => {
        setIsToggled(!isToggled);
        onToggle?.call(null, !isToggled);
    };

    const isStaticImageData = (icon: any): icon is StaticImageData => {
        return icon && (icon as StaticImageData).src !== undefined;
    }

    if (icon && !iconAlt) {
        console.warn("icon provided to ToggleButton component without alt text!", {id, name, text, icon});
    }

    const styleClasses = classNames(className, styles.view);
    const getImage = (icon?: StaticImageData | ToggleIconOptions | React.ReactElement<typeof Image>) : ReactElement<any, any> | undefined => {
        if (isStaticImageData(icon)) {
            return <Image src={icon} alt={iconAlt ?? ""} />
        } else if (React.isValidElement(icon)) {
            return icon;
        } else if (icon?.toggled && icon?.untoggled){
            if (isToggled) {
                return React.isValidElement(icon.toggled) ? icon.toggled : <Image src={icon.toggled} alt={iconAlt ?? ""} />;
            } else {
                return React.isValidElement(icon.untoggled) ? icon.untoggled : <Image src={icon.untoggled} alt={iconAlt ?? ""} />;
            }
        } else {
            return undefined;
        }
        
    }
    return (
        <>
            <button id={id} onClick={toggle} className={styleClasses} {...props} data-toggled={isToggled}>
                {text}
                {getImage(icon)}
            </button>
            {name? <input type="hidden" name={name} value={isToggled.toString()} /> : null}
        </>
    );
};


export default ToggleButton;