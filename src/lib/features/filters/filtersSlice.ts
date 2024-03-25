import { createAppSelector, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"

export interface FiltersState {
    filters: Record<string, any>
};

const initialState : FiltersState = {
    filters: {}
};

export interface SetFilterPayload {
    id: string,
    value: any
};

export const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFilter: (state: FiltersState, action: PayloadAction<SetFilterPayload>) => {
            let {id, value} = action.payload;
            state.filters[id] = value;
        }
    }
});

export const selectFilter = createAppSelector(
    [
        (state: RootState) => state.filters.filters,
        (state: RootState, filter: string) => filter
    ],
    (filters : Record<string, any>, filterId: string) => {
        return filters[filterId];
    }
)

export const selectFilters = (state: RootState) => state.filters.filters;

export default filtersSlice.reducer;