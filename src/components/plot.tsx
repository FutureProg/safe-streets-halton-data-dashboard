'use client'
import React from 'react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PlotData, Data as PlotlyData } from 'plotly.js';
import * as Api from '../api';
import { jsonArrayToPlotDataArr } from '@/util';
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
    let {data, error, isLoading} = Api.getAnnualData(2023);             
    if (error) {
        return "ERROR!";
    }
    if (!data || isLoading) {
        return "LOADING";
    }    
    let plotData = jsonArrayToPlotDataArr(data.data, 'bar', 'municipality', 'number_of_cases', 'description');      
    console.log(plotData);   
    return (
        <div>  
            <Plot
                data={plotData}
                layout={ {width: 800, height: 800, title: 'A Fancy Plot'} }
            />
        </div>
    );
}