import React from "react";
import { InputTextProps } from "./InputText";
import { FormLabelProps } from "./FormLabel";
import styles from './FormElement.module.scss';
import assert from "assert";

export type InputComponent = 
    React.ReactElement<InputTextProps & { id: string }>;

export type FormElementProps = {
    children: [
        React.ReactElement<FormLabelProps & { htmlFor: string }>,       
        InputComponent
    ]
};

const FormElement = ({children: [label, inputComponent]}: FormElementProps) => {
    assert(label.props.htmlFor === inputComponent.props.id, "htmlFor and input id are not the same!");
    assert(label.props.htmlFor && inputComponent.props.id, "label htmlFor or input id not set!");
    return (
        <div className={styles.view}>
            {label}
            {inputComponent}
        </div>
    )
}

export default FormElement;