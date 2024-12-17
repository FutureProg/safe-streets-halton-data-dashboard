import React, { PropsWithChildren } from "react";
import { InputTextProps } from "./InputText";
import { FormLabelProps } from "./FormLabel";
import styles from './FormElement.module.scss';

export type InputComponent = 
    React.ReactElement<InputTextProps>;

export type FormElementProps = {
    children: [
        React.ReactElement<FormLabelProps>,       
        InputComponent
    ]
};

export default ({children: [label, inputComponent]}: FormElementProps) => {
    return (
        <div className={styles.view}>
            {label}
            {inputComponent}
        </div>
    )
}