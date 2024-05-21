'use client';
import { MultiSelectStyles } from "@/types";
import { createContext } from "react";

export interface AppTheme {
    multiSelectStyle : Partial<MultiSelectStyles>;
}
export const defaultAppTheme : AppTheme = {
    multiSelectStyle: {
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
};
export const AppThemeContext = createContext<AppTheme>(defaultAppTheme);

export const AppThemeProvider = ({children}: Readonly<{children: React.ReactNode;}>) => (
  <AppThemeContext.Provider value={defaultAppTheme}>
    {children}
  </AppThemeContext.Provider>
);