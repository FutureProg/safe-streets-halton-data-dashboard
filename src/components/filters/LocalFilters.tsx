import { LocalFilterType } from "@/contexts/LocalFilterContext";

import styles from './Filters.module.css';
import Multiselect from "multiselect-react-dropdown";
import { useContext, useEffect, useState } from "react";
import { MultiSelectStyles } from "@/types";
import { AppThemeContext } from "@/contexts/AppThemeContext";

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

export const LocalFilters = ({onFiltersChanged}: LocalFiltersProps) => {
      let { multiSelectStyle } = useContext(AppThemeContext);            
      let [selectedDescriptions, setSelectedDescriptions] = useState(dropdownDescriptionOptions);                  
      useEffect(() => {
        let localFilters : LocalFilterType = {
          description: selectedDescriptions
        };
        onFiltersChanged(localFilters);
      }, [selectedDescriptions]);

      let onLocalDescFilterChange = (selList: typeof dropdownDescriptionOptions, item: any) => {
        setSelectedDescriptions(selList);
      }

      return (
        <div className={styles.localFiltersRow}>
          <div>
              <span className={styles.filterItem}>
                  <label htmlFor="select-city">Incident Type</label>
                  <Multiselect
                  style={multiSelectStyle}
                  showArrow={true}
                  className="inline-multi-select"
                  options={dropdownDescriptionOptions}
                  selectedValues={selectedDescriptions}
                  onRemove={onLocalDescFilterChange}
                  onSelect={onLocalDescFilterChange}            
                  displayValue="name"                        
                  showCheckbox={true}
                  placeholder={selectedDescriptions.length > 0? `${selectedDescriptions.length} Incident Types` : 'Select at least one incident type'}
                  avoidHighlightFirstOption={true}
                  />
              </span>
            </div>
        </div>
      )

}