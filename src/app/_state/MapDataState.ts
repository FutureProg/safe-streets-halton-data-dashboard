'use client';

import { assign, fromPromise, setup } from 'xstate';
import {createActorContext} from '@xstate/react';

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
    return fetch(baseURL + urlParams).then(Response.json);
}

const mapDataMachine = setup({
    types: {
        context: {} as { data?: any, params?: any, error?: any },
        events: {} as { type: 'request', params: FetchDataParams },
        input: {} as FetchDataParams
    },
    actors: {
        fetchData: fromPromise(async ({ input }) => {
            return fetchData(input as FetchDataParams);
        })
    }
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgBsB7dCAqAYggsJIIDcKBrMEmAFwBF0vdAG0ADAF1EoAA4VYuXribSQAD0QBWAGwBmEmIAs2gBwnDAJhO6AjAE47mgDQgAnohM2Shhw+03dbTFNOwtNAF9wlzQsPEJSSmpaOjAAJ1SKVJIZMiEAM0zUHjABIVFJVTkFJRUkdS09A2MzS2t7Rxd3BBsAdkNvTVsLMR6xOxMLR21IqJB8Cgg4VRicAmJK+UVlfFUNBABabU7EQ4Mxc7FdEz07QxHDE0jojFX4lggyMA3q7d3ES2O3V63h62h0Vh6AR6Fl6TxAKzixHIVBo+Cg3y2tVAewsuk0Bh6nl0dlGNh0JMMgJs9hIJLBgyCPU0mjCujhCLWpFgAFdMJg4PA6lVMTs6ntoV5CTZJnZtP4JoEqZcSBYLGCgsZAqCLIZ2S9EaQ8uhcGRuakvkLNjVRdjEBKSFKZXKbAqjm5EPZtCRerKTJpLn1jJoejNwkA */
    initial: 'idle',
    context: { data: {} },
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
                input: ({ event: {params}}) => ({...params} satisfies FetchDataParams),
                onDone: {
                    target: 'success',
                    actions: assign({data: ({event}) => event.output})
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