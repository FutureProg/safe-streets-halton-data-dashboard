'use client';

import { assign, fromPromise, setup } from 'xstate';
import {createActorContext} from '@xstate/react';
import { CaseData } from '@/common';
import { LatLngExpression } from 'leaflet';
import { ClientSideFilters } from '../common';

export type FetchDataParams = { 
    city: string[], 
    startDate: string | number | Date, 
    endDate: string | number | Date 
}

const fetchData = (params: FetchDataParams) => {
    params.startDate = params.startDate instanceof Date? params.startDate.getTime() : params.startDate;
    params.endDate = params.endDate instanceof Date? params.endDate.getTime() : params.endDate;
    
    const baseURL = '/api/data?';
    let urlParams = new URLSearchParams(Object.entries(params).map(([k,v]) => [k, v as string]));
    return fetch(baseURL + urlParams, {cache: 'no-cache'}).then((response) => response.json());
}

export interface MarkerData {
    options: MarkerDataOptions;
    position: LatLngExpression;
    caseData: CaseData[];
    popupText?: string;
}


export interface MarkerDataOptions {

}

function createMarkerData(data: Record<string, any>[]): MarkerData[] {
    let re: MarkerData[] = [];    
    let tempData : Record<string, CaseData[]> = {};
    const toKeyStr = (lat: number, lng: number) => `${lat},${lng}`;
    for (let record of data) {
        let options: MarkerDataOptions = {};
        let position: LatLngExpression = [record['latitude'], record['longitude']];
        let lngShort = Number.parseFloat((record['longitude'] as number).toFixed(4));
        let latShort = Number.parseFloat((record['latitude'] as number).toFixed(4));
        let keyStr = toKeyStr(latShort, lngShort);
        let caseData: CaseData = {
            case_no: record['caseNo'],
            city: record['city'],
            date: new Date(record['date']),
            description: record['description'],
            globalID: record['globalID'],
            latitude: record['latitude'],
            location: record['location'],
            longitude: record['longitude']
        };
        if (!(keyStr in tempData)) {
            tempData[keyStr] = [];
        }
        tempData[keyStr].push(caseData);
        // let popupText = caseDataToText(caseData);
    }
    for (const key in tempData) {
        let [lat, lng] = key.split(',').map(Number.parseFloat);        
        re.push({ caseData: tempData[key], position: [lat, lng], options: {}, popupText: "test text" });
    }    
    return re;
}

const mapDataMachine = setup({
    types: {
        context: {} as { data?: any, params?: any, error?: any, markerData?: MarkerData[], clientFilters?: ClientSideFilters },
        events: {} as { type: 'request', params: FetchDataParams } | {type: 'filterClient', filters: ClientSideFilters},
        input: {} as FetchDataParams
    },
    actors: {
        fetchData: fromPromise(async ({ input }) => {
            return fetchData(input as FetchDataParams);
        })
    }
}).createMachine({
    initial: 'idle',
    context: { data: {} },
    on: {
        'filterClient': {
            actions: [
                assign({clientFilters: ({event}) => event.filters})
            ]
        }
    },
    
    states: {
        idle: {
            on: {
                'request': {
                    target: 'loading',
                }
            }
        },
        loading: {
            invoke: {
                id: 'getData',
                src: 'fetchData',
                input: ({ event }) => event.type == 'request'? ({...event.params} as FetchDataParams) : undefined,
                onDone: {
                    target: 'success',
                    actions: [
                        assign({data: ({event}) => event.output}),
                        assign({markerData: ({event}) => createMarkerData((event.output as any).data)})
                    ]
                },
                onError: {
                    target: 'failure',
                    actions: assign({error: ({event}) => event.error })
                }
            }
        },
        success: {
            on: {
                'request': {
                    target: 'loading'
                }
            }
        },
        failure: {

        }
    }
});


export const MapDataMachine = mapDataMachine;
export const MapDataContext = createActorContext(mapDataMachine);