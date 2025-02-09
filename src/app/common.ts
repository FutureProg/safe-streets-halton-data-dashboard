export type HTMLInputOption = {
    label: string;
    value: string;
}

export type StaticValues = {
    incidentTypes: HTMLInputOption[],
    cities: HTMLInputOption[]
}

export type ClientSideFilters = {
    incidentTypes: string[]
}