import { LoadState, CaseData, caseDataToText, setLoadStateGeneric } from "@/common";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LatLngExpression, MarkerOptions } from "leaflet";
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
    caseData: CaseData;
    popupText?: string;
}

export interface MarkerDataOptions {

}

const initialState: MapDataState = {
    loadState: LoadState.None,
    data: []
};


export interface LoadDataThunkParams extends Api.FetchCaseDataParams { }
export const loadData = createAsyncThunk("mapData/loadData", async (params: LoadDataThunkParams) => {
    return await Api.fetchCaseData({ ...params } as Api.FetchCaseDataParams);
});

function transformData(data: Record<string, any>[]): MarkerData[] {
    let re: MarkerData[] = [];

    for (let record of data) {
        let options: MarkerDataOptions = {};
        let position: LatLngExpression = [record['latitude'], record['longitude']];
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
        let popupText = caseDataToText(caseData);
        re.push({ caseData, position, options, popupText });
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