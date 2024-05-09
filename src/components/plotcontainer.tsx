'use client';
import React, { useEffect, useRef, useState } from "react";
import styles from './PlotContainer.module.css';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectFilters, setFilters } from "@/lib/features/filters/filtersSlice";
import { useSelector } from "react-redux";
import { clearLoadStates } from "@/lib/actions";
import Multiselect from "multiselect-react-dropdown";
import { MultiSelectStyles } from "@/types";
import { arrayDifference, arrayDisjoint } from "@/util";

export default ({ children,}: Readonly<{ children?: React.ReactNode; }>) => {

    let [isApplyButtonEnabled, setApplyButtonEnabled] = useState(false);
    let [selectedYear, setSelectedYear] = useState(2023);    
    let filter = useAppSelector(selectFilters);
    let dispatch = useAppDispatch();

    // When the filters are changed, re-enable the apply button
    useEffect(() => {
      setApplyButtonEnabled(selectedYear !== filter.year);
    }, [selectedYear])
    let onYearChange = (sel: any) => {                                           
      setSelectedYear(Number.parseInt(sel.target.value));
    };    

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
    const multiSelectStyle : Partial<MultiSelectStyles> = {
      multiselectContainer: {
        display: 'inline-block'      
      }, 
      searchBox: {
        paddingRight: '14px'
      },
      chips: {
        display: 'none'        
      }                 
    }    

    return (
      <div className={styles.plotContainer}>
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
              placeholder={selectedCities.length > 0? `${selectedCities.length} Municipalities Selected` : 'Select a Municipality'}
              avoidHighlightFirstOption={true}
              />
            </span>            
            
            <button className="primary" disabled={!isApplyButtonEnabled} onClick={onApply}>Apply</button>
          </div>                    
        </div>      
        {children}
      </div>
    );
}