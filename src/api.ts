import useSWR, { Fetcher, SWRConfiguration } from "swr";

const DATA_API_URL = process.env.dataAPI;
const fetcher = (...args: any[]) => fetch(args[0], ...args.slice(1)).then(res => res.json());

function getUrl(dir: string, query_params = {}) {
    const url = DATA_API_URL + '/' + dir;
    if (query_params) {
        const params = new URLSearchParams(query_params);        
        return url + '?' + params;
    }    
    return url;
}

const SingleRequestConfig = {
    shouldRetryOnError: false,        
    revalidateOnFocus: false,
    revalidateOnMount:true,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0
} as SWRConfiguration;

interface CountsQueryParams {
    start_date: Date, 
    end_date: Date, 
    group:any[], 
    filter?: string, 
    item_offset?:number, 
    item_count?:number
}
export function getCounts(queryParams: CountsQueryParams) {    
    const url = getUrl('query/count', queryParams);
    let {data, error, isLoading} = useSWR(url,fetcher, SingleRequestConfig);    
    return {data, error, isLoading}
}

export function getAnnualData(year: number) {
    const url = getUrl('annual', {year});     
    // var response = await fetch(url, {method: 'GET'});    
    let {data, error, isLoading} = useSWR(url,fetcher, SingleRequestConfig);    
    return {data, error, isLoading}
}

export async function fetchAnnualData(year: number) {
    const url = getUrl('annual', {year});     
    var response = (await fetch(url, {method: 'GET'})).json();
    return response;
}