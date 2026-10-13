import { convertDateObjectsToISO } from "./util";

const DATA_API_URL = process.env.dataAPI;
function getUrl(dir: string, query_params = {}) {
  const url = DATA_API_URL + "/" + dir;
  if (query_params) {
    const paramsConverted = convertDateObjectsToISO(query_params);
    const params = new URLSearchParams(paramsConverted);
    return url + "?" + params;
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
  var response = (await fetch(url, { method: "GET" })).json();
  return response;
}

interface QueryParamBase {
  itemOffset?: number;
  itemCount?: number;
}

/**
 * Get aggregated data for the specified year
 * @param year The Year to Get Data For
 * @returns
 */
export const fetchAnnualData = async (year: number) => {
  void simpleQuery("query/count", { year });
};

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
  const url = "ssh-dashboard/api/data?" + urLSearchParams;
  return (await fetch(url, { method: "GET" })).json();
};
