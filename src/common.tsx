export enum LoadState {
    None,
    Loading,
    Loaded,    
    Error
};

export interface CaseData {
    case_no: string;
    date: Date;
    description: string;
    location: string;
    city: string;
    latitude: number;
    longitude: number;    
    globalID: string;
}

export const caseDataToText = (data: CaseData) => {
    return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
}
    
export const caseDataToHTML = (data: CaseData) => {
    return Object.entries(data)
        .map(([key, value]) => (<p>{key}: {value instanceof Date? (value as Date).toDateString() : value}</p>));        
}
    