import React, { PropsWithChildren } from "react";
import { InputTextProps } from "./InputText";
import { FormLabelProps } from "./FormLabel";
import styles from './FormElement.module.scss';
import assert from "assert";

export type InputComponent = 
    React.ReactElement<InputTextProps>;

export type FormElementProps = {
    children: [
        React.ReactElement<FormLabelProps>,       
        InputComponent
    ]
};

export default ({children: [label, inputComponent]}: FormElementProps) => {
    assert(label.props.htmlFor == inputComponent.props.id, "htmlFor and input name are not the same!");
    assert(label.props.htmlFor && inputComponent.props.id, "label htmlFor or input name not set!");
    return (
        <div className={styles.view}>
            {label}
            {inputComponent}
        </div>
    )
}