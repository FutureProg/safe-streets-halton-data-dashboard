import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import { PlotData } from "plotly.js";
import * as Api from '@/api';
import {LoadState, setLoadStateGeneric} from '@/common';
import * as Util from '@/util';
import { clearLoadStates } from "@/lib/actions";

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

export interface LoadDataThunkParams extends Api.CountsQueryParams{    
}
export const loadData = createAsyncThunk('graphData/loadData', async(params: LoadDataThunkParams) => {    
    const queryParams : Api.CountsQueryParams = {
        ...params        
    };
    const response = await Api.fetchCounts(queryParams);
    return await response;
});

export const _loadData = createAsyncThunk('graphData/loadAnnual', async(year: number) => {
    const response = await Api.fetchAnnualData(year);
    return await response;
});

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,    
    reducers: {   
        // setLoadState: (state: GraphDataState, action: PayloadAction<LoadState>) => {
        //     state.loadState = action.payload;
        // }
        setLoadState: setLoadStateGeneric<GraphDataState>()
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
                state.data = Util.jsonArrayToPlotDataArr(action.payload.data, 'bar', 'city', 'records', 'description');      
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

export const { setLoadState } = graphDataSlice.actions;
export default graphDataSlice.reducer;

