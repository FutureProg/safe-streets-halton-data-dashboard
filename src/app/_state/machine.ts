import { assign, fromPromise, setup } from 'xstate';
declare namespace ApiEvent {
    const MakeRequest = "api.request";
    const ReceiveResponse = "api.response";
    const ResponseProcessed = "api.success";
}

export type FetchDataParams = { 
    cities: string[], 
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
        events: {} as { type: typeof ApiEvent.MakeRequest } |
        { type: typeof ApiEvent.ReceiveResponse, data: any },
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
    states: {
        idle: {
            on: {
                [ApiEvent.MakeRequest]: {
                    target: 'loading',
                }
            }
        },
        loading: {
            invoke: {
                id: 'getData',
                src: 'fetchData',
                input: ({ context: {params}}) => ({...params}),
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
        processing: {

        }
    }
})
