'use client';

import { createContext, PropsWithChildren } from "react";
import { HTMLInputOption, StaticValues } from "./common";

export const StaticValuesContext = createContext<StaticValues>({incidentTypes: [], cities: []});

export const StaticValuesProvider = (props : PropsWithChildren<{staticValues: StaticValues}>) => {
    return (
        <StaticValuesContext.Provider value={props.staticValues}>
            {props.children}
        </StaticValuesContext.Provider>
    )
}