import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import { PlotData } from "plotly.js";
import * as Api from '@/api';
import * as Util from '@/util';

export enum LoadState {
    None,
    Loading,
    Loaded,    
    Error
};

export interface GraphDataState {
    loadState: LoadState,
    data: Partial<PlotData>[],
    error?: string,
    originalData?: any[]
}

const initialState : GraphDataState = {
    loadState: LoadState.None,
    data: [],
    originalData: []
}

export const loadData = createAsyncThunk('graphData/loadData', async(year: number) => {
    const response = await Api.fetchAnnualData(year);
    return await response;
});

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,    
    reducers: {        
    },
    extraReducers(builder) {
        builder
            .addCase(loadData.pending, (state, action) => {
                state.loadState = LoadState.Loading;
            })
            .addCase(loadData.fulfilled, (state, action) => {
                state.loadState = LoadState.Loaded;
                state.error = undefined;
                state.originalData = action.payload;
                state.data = Util.jsonArrayToPlotDataArr(action.payload.data, 'bar', 'municipality', 'number_of_cases', 'description');      
            })
            .addCase(loadData.rejected, (state, action) => {
                state.loadState = LoadState.Error;
                state.error = action.error.message;
            });
    }
});

export default graphDataSlice.reducer;

