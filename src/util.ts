import { PlotData, PlotType } from "plotly.js";

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

export function convertDateObjectsToISO(obj: object) {
    let re: Record<string, any> = {};
    for(const [key, value] of Object.entries(obj)) {
        if (value && value instanceof Date) {
            re[key] = (value as Date).toISOString();
        } else {
            re[key] = value;
        }
    }
    return re;
}

export const formatDateHtmlInput = (date: Date) => {
    const yearStr = date.getFullYear().toString().padStart(4, "0");
    const monthStr = (date.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = date.getDate().toString().padStart(2, "0");
    return `${yearStr}-${monthStr}-${dayStr}`;
};

export function jsonArrayToPlotDataArr(data: Record<string, any>[], type: PlotType, x: string, y: string ,name?: string, other?: Partial<PlotData>): Partial<PlotData>[] {    
    let result = [] as Partial<PlotData>[];
    if (name) {
        let template = () => ({
            ...other,
            x: [] as any[],
            y: [] as any[],            
            type: type,            
        });
        var preResult = {} as Record<string, any>;         
        for(let i = 0; i < data.length; i++) {
            let item = data[i];
            var _name = item[name];            
            if (!preResult.hasOwnProperty(_name)) {
                preResult[_name] =  {...template(), name: _name};
            }
            preResult[_name].x.push(item[x]);
            preResult[_name].y.push(item[y]);
        }
        console.log(preResult);
        Object.keys(preResult).forEach((key) =>{
            result.push(preResult[key]);
        });                
    } else {        
        let re = {
            ...other,
            x: [] as any[],
            y: [] as any[],
            type: type,            
        };
        for(let i = 0; i < data.length; i++) {
            let item = data[i];
            re.x.push(item[x]);
            re.y.push(item[y]);            
        }        
        result.push(re);
    }
    return result;
}

export function flattenDataAsync(data: Promise<any>) {
    data.then((data: any) => {
        flattenData(data);
    });
    return data;
}

/**
 * Takes an array of items and returns items that are in the first, but not the second array
 * @param list1 the first array
 * @param list2 the second array
 * @returns the items in the first array that aren't in the second
 */
export function arrayDifference(list1 : any[], list2: any[]) : any[] {
    let re : any[] = [];
    list1.forEach(value => {
        if (list2.indexOf(value) == -1) {
            re.push(value);
        }
    });
    return re;
}

/**
 * Finds the values not shared by any of the passed arrays
 * @param arrays the arrays to to compare
 * @returns unique set of values not shared by any provided array
 */
export function arrayDisjoint(...arrays: any[][]) : Set<any>{
    let re : Set<any> = new Set<any>();
    let marked = [];
    // remove duplicate values and flatten
    let flatArr = arrays.map(arr => new Set<any>(arr)).map(value => Array.from(value)).flat();
    for(let i = 0; i < flatArr.length; i++) {
        let value = flatArr[i];
        if (marked.indexOf(value) != -1) {
            continue;
        }
        if (re.has(value)) {
            re.delete(value);
            marked.push(value);            
        } else {
            re.add(value);
        }        
    }
    return re;
}

/**
 * Finds the intersection of all the passed arrays
 * @param arrays list of arrays to compare
 * @returns unique set of values shared by every array passed to the function
 */
export function arrayIntersection(...arrays : any[][]) : Set<any> {
    let re : Set<any> = new Set<any>();
    arrays = arrays.map(arr => new Set<any>(arr)).map(value => Array.from(value));
    for(let i = 0; i < arrays.length; i++) {
        let arr = arrays[i];
        for(let j = 0; j < arrays.length; j++) {
            if (j == i) continue;
            let other = arrays[j];
            arr.forEach(value =>{
                if (other.indexOf(value) != -1) re.add(value);
            });            
        }
    }
    return re;
}