import { LoadState, CaseData, caseDataToText, setLoadStateGeneric } from "@/common";
import { PayloadAction, Tuple, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LatLngExpression, LatLngTuple, MarkerOptions } from "leaflet";
import * as Api from '@/api';
import { clearLoadStates } from "@/lib/actions";

export interface MapDataState {
    loadState: LoadState;
    data: MarkerData[];
    error?: string;
}

export interface MarkerData {
    options: MarkerDataOptions;
    position: LatLngExpression;
    caseData: CaseData[];
    popupText?: string;
}

export interface MarkerDataOptions {

}

const initialState: MapDataState = {
    loadState: LoadState.None,
    data: []
};


export interface LoadDataThunkParams extends Api.FetchCaseDataParams { }
export const loadData = createAsyncThunk("mapData/loadData", async (params: LoadDataThunkParams, thunkAPI) => {
    let totalData = []
    params.item_count = 500;
    let data = await Api.fetchCaseData({ ...params } as Api.FetchCaseDataParams);
    totalData.push(...data.data);
    while (data.hit_request_limit) {
        params.item_offset = data.offset + data.limit;        
        data = await Api.fetchCaseData({ ...params } as Api.FetchCaseDataParams);
        totalData.push(...data.data);
    }
    data.data = totalData;    
    return await data;
});

function transformData(data: Record<string, any>[]): MarkerData[] {
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
            case_no: record['case_no'],
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

export const mapDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        setLoadState: setLoadStateGeneric<MapDataState>()
    },
    extraReducers(builder) {
        builder
            .addCase(loadData.pending, (state, action) => {
                state.loadState = LoadState.Loading;
            })
            .addCase(loadData.fulfilled, (state, action) => {                                
                state.loadState = LoadState.Loaded;                
                state.error = undefined;                
                state.data = transformData(action.payload.data);  
            })
            .addCase(loadData.rejected, (state, action) => {
                state.loadState = LoadState.Error;
                state.error = action.error.message;
            });
        builder.addCase(clearLoadStates, (state, action) => {
                state.loadState = LoadState.None;
            });
    }
});

export const { setLoadState } = mapDataSlice.actions;
export default mapDataSlice.reducer;