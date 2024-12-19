import { ForwardedRef, forwardRef, InputHTMLAttributes, useRef } from 'react';
import styles from './InputText.module.scss';
import classNames from 'classnames';

export type InputTextProps = InputHTMLAttributes<HTMLInputElement>;

export default forwardRef(({className, type = "text", ...props}: InputTextProps, ref: ForwardedRef<HTMLInputElement>) => {
    const cssClasses = classNames(className, styles.view);
    return (
        <input {...props} className={cssClasses} type={type} ref={ref} />
    )
});