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

export function jsonArrayToPlotDataArr(data: Record<string, any>[], type: PlotType, x: string, y: string ,name?: string, other?: Partial<PlotData>): Partial<PlotData>[] {    
    let result = [] as Partial<PlotData>[];
    if (name) {
        let template = {
            ...other,
            x: [] as any[],
            y: [] as any[],            
            type: type,            
        }
        let preResult = {} as Record<string, typeof template>;        
        for(let i = 0; i < data.length; i++) {
            let item = data[i];
            var _name = item[name];
            if (!preResult.hasOwnProperty(_name)) {
                preResult[_name] =  {...template, name: _name};
            }
            preResult[_name].x.push(item[x]);
            preResult[_name].y.push(item[y]);
        }
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