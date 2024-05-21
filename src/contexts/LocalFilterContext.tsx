import { useContext, createContext } from "react";

export type LocalFilterType = {
    description: string[]
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
export const defaultFilters = {
    description: caseDescriptions
};

export const LocalFilterContext = createContext(defaultFilters);