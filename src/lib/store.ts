import { configureStore } from '@reduxjs/toolkit';
import graphDataReducer from '@/lib/features/graphdata/graphDataSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {graphData: graphDataReducer}
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
