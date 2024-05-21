import { AppThemeContext } from "@/contexts/AppThemeContext";
import Multiselect from "multiselect-react-dropdown";
import { ChangeEvent, useContext, useState } from "react";
import styles from './Filters.module.css';

export type DropDownChangeEventType = 'added' | 'removed' | 'select';

/**
 * Props for the dropdown filter, where T is the type of value the dropdown item should hold (e.g. string, int)
 */
export interface DropDownFilterProps<T> {
    /**
     * Callback called when the selected items of the dropdown are changed
     * @param allSelectedOptions All of the selected options (1 if not multiselect)
     * @param changeType the type of change (either 'added' or 'removed') if multiselect is set to true
     * @param item the item that was changed
     * @returns nothing
     */
    onChange: (allSelectedOptions: T[], changeType: DropDownChangeEventType, item: T) => void;

    /**
     * If it's a multiselect dropdown or not
     */
    multiselect?: boolean;

    /**
     * The default values to that should be selected
     */
    defaultSelection: T[] | T;

    /**
     * All of the dropdown options
     */
    options: DropDownOption<T>[];
    
    /**
     * The singular noun representing the dropdown item to display e.g. "municipality" for a list of municipalities
     */
    nounSingular?: string;

    /**
     * The plural noun representing the dropdown item to display e.g. "municipalities" for a list of municipalities
     */
    nounPlural?: string;

    /**
     * The label to place beside the dropdown filter
     */
    label?: string;
};

export type DropDownOption<T> = {
    name: string; // the string displayed via the dropdown
    value: T;
}

export const DropDownFilter = <T,>(props: DropDownFilterProps<T>) => {
    let {multiSelectStyle} = useContext(AppThemeContext);
    let [selectedValues, setSelectedValues] = useState(props.multiselect? props.defaultSelection as T[] : props.defaultSelection as T);    

    let selector = <></>;
    if (props.multiselect) {
        let noun = props.nounSingular || 'item';
        let nounPlural = props.nounPlural || 'items';
        let onChange = (changeType: DropDownChangeEventType) => (selList: DropDownOption<T>[], item: DropDownOption<T>) => {
            let values = selList.map(item => item.value);
            props.onChange(values, changeType, item.value);
            setSelectedValues(values);
        }
        let defaultSelection = props.options.filter(({name, value}, idx) => (props.defaultSelection as T[]).indexOf(value) >= 0)        
        selector = (
            <Multiselect
              style={multiSelectStyle}
              showArrow={true}
              className="inline-multi-select"
              options={props.options}              
              selectedValues={defaultSelection}
              onRemove={onChange("removed")}
              onSelect={onChange("added")}
              displayValue="name"                        
              showCheckbox={true}
              placeholder={(selectedValues as T[]).length > 0? `${(selectedValues as T[]).length} ${nounPlural} selected` : `Select at least one ${noun}`}
              avoidHighlightFirstOption={true}
              />
        )
    } else {
        let options = props.options.map(({ name, }, idx) => <option key={idx} value={idx}>{name}</option>);
        let onChange = (evt: ChangeEvent<HTMLSelectElement>) => {
            let selection = Number(evt.target.value);
            let selectedOption = props.options[selection].value;
            props.onChange([selectedOption], 'select', selectedOption);
        }
        selector = (
            <select name="year" id="select-1" onChange={onChange} defaultValue={0}>
                {options}
            </select>
        )
    }

    return (
        <span className={styles.filterItem}>
            {props.label? <label>{props.label}</label> : <></>}
            {selector}
        </span>
    )
}