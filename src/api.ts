import { flattenDataAsync } from "./util";
const DATA_API_URL = process.env.dataAPI;

function getUrl(dir: string, query_params = {}) {
    const url = DATA_API_URL + '/' + dir;
    const params = new URLSearchParams(query_params);
    return url + params;
}

export async function getAnnualData(year: number, flatten = true) {
    const url = getUrl('annual', {year});     
    var response = await fetch(url, {method: 'GET'});
    if (flattenDataAsync) {
        return flattenDataAsync(response.json());        
    }
    return response.json();
}