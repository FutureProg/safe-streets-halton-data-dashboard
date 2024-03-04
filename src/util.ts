import { PlotData } from "plotly.js";

export function flattenData(data: Array<Record<string, any>>) {
    var result : Record<string, any> = {}; 
    data.forEach(element => {
        Object.keys(element).forEach((key: string) => {
            if (!result.hasOwnProperty(key)) {
                result[key] = [];
            }
            result[key].push(element[key]);
        });
    });
    return result;
}

export function jsonArrayToPlotData<T>(data: Record<string, any>[], keys: string[]): Partial<PlotData>[] {
    var result = {} as T;
    
    return result;
}

export function flattenDataAsync(data: Promise<any>) {
    data.then((data: any) => {
        flattenData(data);
    });
    return data;
}