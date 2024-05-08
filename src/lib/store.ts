import { configureStore, createAction } from '@reduxjs/toolkit';
import graphDataReducer from '@/lib/features/graphdata/graphDataSlice';
import filtersReducer from '@/lib/features/filters/filtersSlice';
import mapDataReducer, { setLoadState as setMapDataLoadState } from './features/mapData/mapDataSlice';
import { LoadState } from '@/common';

export const makeStore = () => {
    return configureStore({
        reducer: {
            graphData: graphDataReducer,
            filters: filtersReducer,
            mapData: mapDataReducer
        }
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
