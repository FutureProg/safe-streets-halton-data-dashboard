import Image, { StaticImageData } from "next/image";
import { LabelHTMLAttributes, PropsWithChildren } from "react";
import styles from './FormLabel.module.scss';

export type FormLabelProps = {
    icon?: {
        src: StaticImageData,
        alt: string
    };
} & PropsWithChildren & LabelHTMLAttributes<HTMLLabelElement>;

export default ({children, icon, ...htmlProps}: FormLabelProps) => {
    return (
        <label className={styles.view} {...htmlProps}>
            {icon? <Image className={styles.image} src={icon.src} alt={icon.alt}/> : null}
            {children}
        </label>
    )
}