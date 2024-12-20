'use client'
import React, { useContext, useRef, useState } from 'react';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { LoadDataThunkParams, loadData } from '@/lib/features/graphdata/graphDataSlice';
import {LoadState} from '@/common';
import { DataPlot } from '@/types';
const PlotlyPlot = dynamic(() => import('react-plotly.js'), { ssr: false });

import styles from './ChartPlot.module.css';
import { selectFilters } from '@/lib/features/filters/filtersSlice';
import { LocalFilterContext } from '@/contexts/LocalFilterContext';

interface AnnualDataArr {
    municipality: string,
    description: Array<string>,
    number_of_cases: Array<number>,
    number_of_entries: Array<number>
};

interface AnnualData {
    municipality: string,
    description: string,
    number_of_cases: number,
    number_of_entries: number
};

export const UIPlot =  (/*{data}: {data: Partial<PlotData>[]}*/) : DataPlot => {    
    // const defaultData = [] as Partial<PlotData>[];
    // const [data, setData] = useState(defaultData);
    // ///{type: 'bar', x: data.municipality, y: data.number_of_cases, name: data.description},

    let localFilters = useContext(LocalFilterContext);

    let {error, loadState, data} = useAppSelector((state) => state.graphData);      
    let filters = useAppSelector(selectFilters);
    let dispatch = useAppDispatch();

    let presentationData = data.filter((plotData) => localFilters.description.indexOf(plotData.name!) >= 0);

    useEffect(() => {
        if (loadState == LoadState.None) {
            var params : LoadDataThunkParams = {
                startDate: new Date(filters.year, 0, 1).getTime(),
                endDate: new Date(filters.year, 11, 31).getTime(),    
                excludedCities: filters.excluded_cities,
                groupBy: ['city', 'description']                
            }
            if (filters.excluded_cities.length > 0) {
                params.filter = `city not in (${filters.excluded_cities.map(x => `"${x}"`).join(",")})`;
            } 
            dispatch(loadData(params));
        }
    }, [dispatch, loadState, filters]); // also for when "Applied Filters" store state changes

    let chartPlotContainer = useRef<HTMLDivElement>(null);
    let [plotWidth, setPlotWidth] = useState(800);
    useEffect(() => {
        if (chartPlotContainer.current) {
            setPlotWidth(chartPlotContainer.current.getBoundingClientRect().width);
        }        
    }, [chartPlotContainer]);
    
    if (error) {
        return (
            <div className={`${styles.chartPlot} ${styles.plotLoading}`}>
                <b>Error Loading Plot!<br/> {error}</b>
            </div>
        );
    }
    if (!data || loadState === LoadState.Loading) {
        return (
            <div className={`${styles.chartPlot} ${styles.plotLoading}`}>
                <b>Plot Loading...</b>
            </div>
        );
    }    
    return (
        <div ref={chartPlotContainer} className={styles.chartPlot}>  
            <PlotlyPlot
                data={presentationData}
                layout={ {width: plotWidth, height: 800, title: ''} }
            />
        </div>
    );
}

export default UIPlot;