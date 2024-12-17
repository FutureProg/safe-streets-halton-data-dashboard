import React, { FormHTMLAttributes } from "react";
import { FormLabelProps } from "./FormLabel";
import { InputTextProps } from "./InputText";
import Button, { ButtonSize, ButtonVariant } from "./Button";
import styles from './SimpleForm.module.scss';

export type InputComponent = 
    React.ReactElement<InputTextProps>;

export type SimpleFormProps = {
    children: [
        React.ReactElement<FormLabelProps>,       
        InputComponent
    ],
    buttonText?: string
} & FormHTMLAttributes<HTMLFormElement>
export default ({children, buttonText = 'Submit', ...htmlProps}: SimpleFormProps) => {
    const [label, inputComponent] = children;
    return (
        <form {...htmlProps} className={styles.view}>
            {label}
            <div className={styles.inputRow}>
                {inputComponent}
                <Button size={ButtonSize.Small} variant={ButtonVariant.Primary} type="submit">{buttonText}</Button>
            </div>
        </form>
    )
}