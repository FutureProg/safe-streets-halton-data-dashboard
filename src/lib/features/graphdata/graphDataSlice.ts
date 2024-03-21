import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import { PlotData } from "plotly.js";

enum LoadState {
    None,
    Loaded,
    Loading,
    Error
}

interface GraphDataState {
    loadState: LoadState
    data: Partial<PlotData>,
    originalData?: any[]
}

const initialState : GraphDataState = {
    loadState: LoadState.None,
    data: {},
    originalData: []
}

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        loadData: (state, action: PayloadAction<number>) => {
            
        }
    }
});

export default graphDataSlice.reducer;

