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
