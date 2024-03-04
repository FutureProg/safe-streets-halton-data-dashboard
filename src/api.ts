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

export function getAnnualData(year: number) {
    const url = getUrl('annual', {year});     
    // var response = await fetch(url, {method: 'GET'});    
    let config = {
        shouldRetryOnError: false,
        revalidateOnMount: true
    } as SWRConfiguration;
    let {data, error, isLoading} = useSWR(url,fetcher, config);    
    return {data, error, isLoading}
}