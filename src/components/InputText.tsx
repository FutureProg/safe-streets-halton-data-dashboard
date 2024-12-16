import { InputHTMLAttributes } from 'react';
import styles from './InputText.module.scss';

export type InputTextProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">

export default (props: InputTextProps) => {
    return (
        <input {...props} className={styles.view} type="text" />
    )
}