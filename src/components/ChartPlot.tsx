'use client'
import React from 'react';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { LoadState, loadData } from '@/lib/features/graphdata/graphDataSlice';
import { DataPlot } from '@/types';
const PlotlyPlot = dynamic(() => import('react-plotly.js'), { ssr: false });

import styles from './ChartPlot.module.css';

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
    let {error, loadState, data} = useAppSelector((state) => state.graphData);    
    let dispatch = useAppDispatch();
    useEffect(() => {
        if (loadState == LoadState.None) {
            dispatch(loadData(2023));
        }
    }, [dispatch, loadState]); // also for when "Applied Filters" store state changes

    
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
        <div className={styles.chartPlot}>  
            <PlotlyPlot
                data={data}
                layout={ {width: 800, height: 800, title: 'A Fancy Plot'} }
            />
        </div>
    );
}

export default UIPlot;