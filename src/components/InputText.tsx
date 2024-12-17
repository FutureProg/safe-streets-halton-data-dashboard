import { InputHTMLAttributes } from 'react';
import styles from './InputText.module.scss';
import classNames from 'classnames';

export type InputTextProps = InputHTMLAttributes<HTMLInputElement>;

export default ({className, type = "text", ...props}: InputTextProps) => {
    const cssClasses = classNames(className, styles.view);
    return (
        <input {...props} className={cssClasses} type={type} />
    )
}