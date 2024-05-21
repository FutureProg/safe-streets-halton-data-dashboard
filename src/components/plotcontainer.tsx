'use client';
import React, { useContext, useEffect, useRef, useState } from "react";
import styles from './PlotContainer.module.css';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectFilters, setFilters } from "@/lib/features/filters/filtersSlice";
import { useSelector } from "react-redux";
import { clearLoadStates } from "@/lib/actions";
import Multiselect from "multiselect-react-dropdown";
import { MultiSelectStyles } from "@/types";
import { arrayDifference, arrayDisjoint } from "@/util";
import { LocalFilterContext, LocalFilterType } from "@/contexts/LocalFilterContext";

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

    let caseDescriptions = [
      'MVC - HIT & RUN',
      'THEFT OF BICYCLE',
      'ROADSIDE TEST',
      'IMPAIRED DRIVING',
      'MVC - PI',
      'DANGEROUS OPERATION - TRAFFIC',
      'MVC - FATALITY'
  ];;
    let dropdownDescriptionOptions = caseDescriptions.map((val) => ({'value': val, 'name': val}))
    let [selectedDescriptions, setSelectedDescriptions] = useState(dropdownDescriptionOptions);
    let onLocalDescFilterChange = (selList: typeof dropdownDescriptionOptions, item: any) => {
      setSelectedDescriptions(selList);
    }

    let localFilters : LocalFilterType = {
      description: selectedDescriptions
    };
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
              placeholder={selectedCities.length > 0? `${selectedCities.length} Municipalities Selected` : 'Select at least one municipality'}
              avoidHighlightFirstOption={true}
              />
            </span>            
            
            <button className="primary" disabled={!isApplyButtonEnabled} onClick={onApply}>Apply</button>
          </div>                              
        </div>
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
        <LocalFilterContext.Provider value={localFilters}>
          {children}
        </LocalFilterContext.Provider>        
      </div>
    );
}