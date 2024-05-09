import { createAppSelector, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"

export interface FiltersState {
    year: number;
    excluded_cities: string[];
};

const initialState : FiltersState = {
    year: 2023,
    excluded_cities: []
};

export type SetFilterPayload = Partial<FiltersState>;

export const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFilters: (state: FiltersState, action: PayloadAction<SetFilterPayload>) => {            
            state = {
                ...state,
                ...action.payload
            }            
            return state;
        }
    }
});

export const selectFilters = (state: RootState) => state.filters;
export const {setFilters} = filtersSlice.actions;

export default filtersSlice.reducer;