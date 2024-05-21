'use client';
import Multiselect from 'multiselect-react-dropdown';
import styles from './Filters.module.css';
import { useContext, useEffect, useState } from 'react';
import { AppThemeContext } from '@/contexts/AppThemeContext';
import { arrayDifference, arrayDisjoint } from '@/util';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectFilters, setFilters } from '@/lib/features/filters/filtersSlice';
import { clearLoadStates } from '@/lib/actions';

export const ServerFilters = () => {
    let {multiSelectStyle} = useContext(AppThemeContext);
    let [isApplyButtonEnabled, setApplyButtonEnabled] = useState(false);
    let [selectedYear, setSelectedYear] = useState(2023);    
    let filter = useAppSelector(selectFilters);
    let dispatch = useAppDispatch();    

    let cities = ['ACTON', 'BURLINGTON', 'GEORGETOWN', 'HALTON HILLS', 'MILTON', 'OAKVILLE'];        
    let cityDropdownOptions = cities.map((cityName) => ({      
      'value': cityName, 
      'name': cityName.toLowerCase().split(" ").map((part) => part.charAt(0).toUpperCase() + part.substring(1)).join(" ")
    }));
    let [selectedCities, setSelectedCities] = useState(cityDropdownOptions);
    let onCityChange = (selList: typeof cityDropdownOptions, item: any) => {
      setSelectedCities(selList);
    }    
    useEffect(() => {
      let tempArr = selectedCities.map(x => x.value);
      let newExcludes = arrayDifference(cities, tempArr);
      let result = arrayDisjoint(newExcludes, filter.excluded_cities);
      console.log(result);
      let enableApply = arrayDisjoint(newExcludes, filter.excluded_cities).size > 0;
      setApplyButtonEnabled(enableApply);              
    }, [selectedCities])

    let onApply = () => {  
        console.log(selectedYear);    
        
        let tempArr = selectedCities.map(x => x.value);
  
        dispatch(setFilters({
          year: selectedYear,
          excluded_cities: arrayDifference(cities, tempArr)
        }));      
        dispatch(clearLoadStates());
        setApplyButtonEnabled(false);
    } 
     // When the filters are changed, re-enable the apply button
    useEffect(() => {
        setApplyButtonEnabled(selectedYear !== filter.year);
    }, [selectedYear]);
    let onYearChange = (sel: any) => {                                           
        setSelectedYear(Number.parseInt(sel.target.value));
    }; 

    return (
        <div className={styles.filtersRow}>
          <div>
            <span className={styles.filterItem}>
              <label htmlFor="select-1">Year</label>
              <select name="year" id="select-1" onChange={onYearChange} defaultValue={selectedYear}>
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>            
              </select>
            </span>            
            <span className={styles.filterItem}>
              <label htmlFor="select-city">Municipality</label>
              <Multiselect
              style={multiSelectStyle}
              showArrow={true}
              className="inline-multi-select"
              options={cityDropdownOptions}
              selectedValues={selectedCities}
              onRemove={onCityChange}
              onSelect={onCityChange}            
              displayValue="name"                        
              showCheckbox={true}
              placeholder={selectedCities.length > 0? `${selectedCities.length} Municipalities Selected` : 'Select at least one municipality'}
              avoidHighlightFirstOption={true}
              />
            </span>            
            
            <button className="primary" disabled={!isApplyButtonEnabled} onClick={onApply}>Apply</button>
          </div>                              
        </div> 
    )
}