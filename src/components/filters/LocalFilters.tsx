import { LocalFilterType } from "@/contexts/LocalFilterContext";

import styles from './Filters.module.css';
import Multiselect from "multiselect-react-dropdown";
import { useContext, useEffect, useState } from "react";
import { MultiSelectStyles } from "@/types";
import { AppThemeContext } from "@/contexts/AppThemeContext";
import { DropDownChangeEventType, DropDownFilter } from "./DropDownFilter";

export type LocalFiltersProps = {
  onFiltersChanged: (filters: LocalFilterType) => void
}

let caseDescriptions = [
  'MVC - HIT & RUN',
  'THEFT OF BICYCLE',
  'ROADSIDE TEST',
  'IMPAIRED DRIVING',
  'MVC - PI',
  'DANGEROUS OPERATION - TRAFFIC',
  'MVC - FATALITY'
];
let dropdownDescriptionOptions = caseDescriptions.map((val) => ({'value': val, 'name': val}));

/**
 * Used to display filters that are applied locally
 * @param props - the props of the component
 */
export const LocalFilters = ({onFiltersChanged}: LocalFiltersProps) => {
      let { multiSelectStyle } = useContext(AppThemeContext);            
      let [selectedDescriptions, setSelectedDescriptions] = useState(caseDescriptions);                  
      useEffect(() => {
        let localFilters : LocalFilterType = {
          description: selectedDescriptions
        };
        onFiltersChanged(localFilters);
      }, [selectedDescriptions]);

      let onLocalDescFilterChange = (selList: string[], changeType: DropDownChangeEventType , item: any) => {
        setSelectedDescriptions(selList);
      }

      return (
        <div className={styles.localFiltersRow}>
          <div>
            <DropDownFilter<string>
              multiselect={true}
              onChange={onLocalDescFilterChange}
              defaultSelection={caseDescriptions}
              options={dropdownDescriptionOptions}
              label="Incident Type"
              nounPlural="incident types"
              nounSingular="incident type"
              />
            </div>
        </div>
      )

}