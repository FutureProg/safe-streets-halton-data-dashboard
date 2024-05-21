import { useContext, createContext } from "react";

export type LocalFilterType = {
    description: {name: string, value: string}[]
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
let defaultFilters = {
    description: dropdownDescriptionOptions
};

export const LocalFilterContext = createContext(defaultFilters);