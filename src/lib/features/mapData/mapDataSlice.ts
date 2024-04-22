import { LoadState, CaseData } from "@/common";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LatLngExpression, MarkerOptions } from "leaflet";
import { Marker } from "react-leaflet";

export interface MapDataState {
    loadState: LoadState,
    data: MarkerData[]
    error?: string;
}

export interface MarkerData {
    options: MarkerOptions;
    position: LatLngExpression;
    caseData: CaseData;
}

const initialState : MapDataState = {
    loadState: LoadState.None,
    data: []
};

export const loadData = createAsyncThunk("mapData/loadData", async(params) => {
    
});

export const mapDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(loadData.pending, (state, action) => {
                state.loadState = LoadState.Loading;
            })
            .addCase(loadData.fulfilled, (state, action) => {
                state.loadState = LoadState.Loaded;
                state.error = undefined;
                state.data = 
            })
            .addCase(loadData.rejected, (state, action) => {
                state.loadState = LoadState.Error;
                state.error = action.error.message;            
            });
    }
})

