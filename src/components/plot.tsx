'use client'
import React from 'react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PlotData, Data as PlotlyData } from 'plotly.js';
import * as Api from '../api';
import { jsonArrayToPlotDataArr } from '@/util';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { LoadState, loadData } from '@/lib/features/graphdata/graphDataSlice';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

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

export default (/*{data}: {data: Partial<PlotData>[]}*/) => {    
    // const defaultData = [] as Partial<PlotData>[];
    // const [data, setData] = useState(defaultData);
    // ///{type: 'bar', x: data.municipality, y: data.number_of_cases, name: data.description},
    let {error, loadState, data} = useAppSelector((state) => ({...state.graphData, originalData: undefined}));    
    let dispatch = useAppDispatch();
    useEffect(() => {
        if (loadState == LoadState.None) {
            dispatch(loadData(2023));
        }
    }, [dispatch, loadState]);

    
    if (error) {
        return (
            <div className='plot-loading' style={{width: '800px', height: '800px'}}>
                <b>Error Loading Plot!<br/> {error}</b>
            </div>
        );
    }
    if (!data || loadState === LoadState.Loading) {
        return (
            <div className='plot-loading' style={{width: '800px', height: '800px'}}>
                <b>Plot Loading...</b>
            </div>
        );
    }    
    return (
        <div>  
            <Plot
                data={data}
                layout={ {width: 800, height: 800, title: 'A Fancy Plot'} }
            />
        </div>
    );
}