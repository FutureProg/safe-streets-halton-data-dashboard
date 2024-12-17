import React, { FormHTMLAttributes } from "react";
import { FormLabelProps } from "./FormLabel";
import { InputTextProps } from "./InputText";
import Button, { ButtonSize, ButtonVariant } from "./Button";
import styles from './SimpleForm.module.scss';
import { FormElementProps } from "./FormElement";

export type SimpleFormProps = {
    children: React.ReactElement<FormElementProps>[] | React.ReactElement<FormElementProps>;
    buttonText?: string;
} & FormHTMLAttributes<HTMLFormElement>
export default ({children, buttonText = 'Submit', ...htmlProps}: SimpleFormProps) => {
    return (
        <form {...htmlProps} className={styles.view}>
            <div className={styles.inputRow}>
                {children}
            </div>
            <Button size={ButtonSize.Small} variant={ButtonVariant.Primary} type="submit">{buttonText}</Button>
        </form>
    )
}