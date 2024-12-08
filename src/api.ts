import useSWR, { Fetcher, SWRConfiguration } from "swr";
import { convertDateObjectsToISO } from "./util";

const DATA_API_URL = process.env.dataAPI;
const fetcher = (...args: any[]) => fetch(args[0], ...args.slice(1)).then(res => res.json());

function getUrl(dir: string, query_params = {}) {
    const url = DATA_API_URL + '/' + dir;    
    if (query_params) {
        const paramsConverted = convertDateObjectsToISO(query_params);
        const params = new URLSearchParams(paramsConverted);
        return url + '?' + params;
    }    
    return url;
}

/**
 * Queries the server via a get request with the specified params
 * @param dir The URL to connect to on the API server
 * @param params the parameters to pass via the GET request
 * @returns a JSON Promise of the request
 */
export async function simpleQuery(dir: string, params = {}) {
    const url = getUrl(dir, params);
    var response = (await fetch(url, {method: 'GET'})).json();
    return response;
}

interface QueryParamBase {
    itemOffset?: number;
    itemCount?: number;
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

export interface CountsQueryParams {
    start_date: Date, 
    end_date: Date, 
    group:any[], 
    filter?: string, 
    excluded_cities?: string[],
    item_offset?:number, 
    item_count?:number
}
/**
 * Fetch aggregated data for the specified time frame
 * @param queryParams the parameters for the aggregated data 
 * @returns data aggregated as specified by the user, giving the number of incidents and number of entries
 */
export const fetchCounts = async (queryParams: CountsQueryParams) => simpleQuery('query/count', queryParams);    

/**
 * Get aggregated data for the specified year
 * @param year The Year to Get Data For
 * @returns 
 */
export const fetchAnnualData = async (year: number) => simpleQuery('query/count', {year});

export interface FetchCaseDataParams extends QueryParamBase {
    startDate: number;
    endDate: number;
    excludedCities?: string[];   
}
/**
 * Fetch case data with the specified constraints
 * @param params 
 * @returns 
 */
export const fetchCaseData = async (params: FetchCaseDataParams) => {
    const urLSearchParams = new URLSearchParams(Object.entries(params));
    const url = 'ssh-dashboard/api/data?' + urLSearchParams;
    return (await fetch(url, {method: 'GET'})).json();
}