'use client';
import React, { useEffect, useRef, useState } from "react";
import styles from './PlotContainer.module.css';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectFilters, setFilters } from "@/lib/features/filters/filtersSlice";
import { useSelector } from "react-redux";
import { clearLoadStates } from "@/lib/actions";

export default ({ children,}: Readonly<{ children?: React.ReactNode; }>) => {

    let [isApplyButtonEnabled, setApplyButtonEnabled] = useState(false);
    let [selectedYear, setSelectedYear] = useState(2023);
    let filter = useAppSelector(selectFilters);
    let dispatch = useAppDispatch();

    let yearDropdown = useRef<HTMLSelectElement>(null);

    useEffect(() => {
      setApplyButtonEnabled(true);
    }, [selectedYear])

    let onChange = (sel: any) => {                                     
        console.log(sel.target.value);
        setSelectedYear(Number.parseInt(sel.target.value));
    };

    let onApply = () => {  
      console.log(selectedYear);    
      dispatch(setFilters({
        year: selectedYear
      }));      
      dispatch(clearLoadStates());
      setApplyButtonEnabled(false);
    }

    return (
      <div className={styles.plotContainer}>
        <div className={styles.filtersRow}>
          <div>
            <label htmlFor="select-1">Year</label>
            <select ref={yearDropdown} name="year" id="select-1" onChange={onChange} defaultValue={selectedYear}>
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>            
            </select>            
            <button className="primary" disabled={!isApplyButtonEnabled} onClick={onApply}>Apply</button>
          </div>                    
        </div>      
        {children}
      </div>
    );
}