'use client';
import Multiselect from 'multiselect-react-dropdown';
import styles from './Filters.module.css';
import { useContext, useEffect, useState } from 'react';
import { AppThemeContext } from '@/contexts/AppThemeContext';
import { arrayDifference, arrayDisjoint } from '@/util';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectFilters, setFilters } from '@/lib/features/filters/filtersSlice';
import { clearLoadStates } from '@/lib/actions';
import { DropDownChangeEventType, DropDownFilter } from './DropDownFilter';


/**
 * Contains filters that are sent to the server when fetching data after clicking the apply button.
 * @returns A "view" containing each of the filters.
 */
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
    let [selectedCities, setSelectedCities] = useState(cities);
    let onCityChange = (selList: typeof cities, item: any) => {
      setSelectedCities(selList);
    }    
    useEffect(() => {
      let tempArr = selectedCities;
      let newExcludes = arrayDifference(cities, tempArr);
      let result = arrayDisjoint(newExcludes, filter.excluded_cities);
      console.log(result);
      let enableApply = arrayDisjoint(newExcludes, filter.excluded_cities).size > 0;
      setApplyButtonEnabled(enableApply);              
    }, [selectedCities])

    let onApply = () => {  
        console.log(selectedYear);    
        
        let tempArr = selectedCities;
  
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
    let onYearChange = (allSelectedOptions: number[], changeType: DropDownChangeEventType, item: number) => {                                           
        setSelectedYear(allSelectedOptions[0]);
    }; 

    return (
        <div className={styles.filtersRow}>
          <div>
            <DropDownFilter<number>
                defaultSelection={selectedYear}
                onChange={onYearChange}
                options={[
                    {name: '2023', value: 2023},
                    {name: '2024', value: 2024}
                ]}                
                label='Year'
            />
            <DropDownFilter<string>
                defaultSelection={selectedCities}
                onChange={onCityChange}
                options={cityDropdownOptions}                
                label='Municipality'
                multiselect={true}
                nounPlural='municipalities'
                nounSingular='municipality'
            />            
            <button className="primary" disabled={!isApplyButtonEnabled} onClick={onApply}>Apply</button>
          </div>                              
        </div> 
    )
}