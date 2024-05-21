'use client';
import React, { useContext, useEffect, useRef, useState } from "react";
import styles from './PlotContainer.module.css';
import { LocalFilterContext, LocalFilterType, defaultFilters } from "@/contexts/LocalFilterContext";
import { LocalFilters } from "./filters/LocalFilters";
import { ServerFilters } from "./filters/ServerFilters";

export default ({ children,}: Readonly<{ children?: React.ReactNode; }>) => {                 
    
    let [localFilters, setLocalFilters] = useState<LocalFilterType>(defaultFilters);

    return (
      <div className={styles.plotContainer}>        
        <ServerFilters />     
        <LocalFilters onFiltersChanged={setLocalFilters} />
        <LocalFilterContext.Provider value={localFilters}>
          {children}
        </LocalFilterContext.Provider>        
      </div>
    );
}