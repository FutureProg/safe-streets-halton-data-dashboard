'use client';
import React, { useState } from "react";
import styles from './PlotContainer.module.css';

export default ({ children,}: Readonly<{ children?: React.ReactNode; }>) => {

    let [isApplyButtonEnabled, setApplyButtonEnabled] = useState(false);
    let [selectedYear, setSelectedYear] = useState(2023);
    let onChange = (sel: any) => {
        const selectedVal = sel.target.value;                        
        setApplyButtonEnabled(selectedVal != "");
    };

    let filterData = {

    };

    return (
      <div className={styles.plotContainer}>
        <div className={styles.filtersRow}>
          <div>
            <label htmlFor="select-1">Year</label>
            <select name="year" id="select-1" onChange={onChange}>
              <option value=""></option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>            
            </select>            
            <button className="primary" disabled={!isApplyButtonEnabled}>Apply</button>
          </div>                    
        </div>      
        {children}
      </div>
    );
}