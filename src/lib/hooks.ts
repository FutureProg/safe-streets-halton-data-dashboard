import { UseDispatch, useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./store";
import { createSelector } from "@reduxjs/toolkit";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
export const createAppSelector = createSelector.withTypes<RootState>();
