import React from 'react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PlotData, Data as PlotlyData } from 'plotly.js';
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

export default () => {    
    const defaultData = [] as Array<AnnualData>;
    const [data, setData] = useState(defaultData)
    var renderData = [] as Partial<PlotData>[];
    Object.values(preRenderData).forEach((value) => {
        renderData.push({
            type: 'bar',
            x: value.,
            y: 
        });
    });
    return (
        <div>  
            <Plot
                data={[
                    // {
                    // x: [1, 2, 3],
                    // y: [2, 6, 3],
                    // type: 'scatter',
                    // mode: 'lines+markers',
                    // marker: {color: 'red'},
                    // },
                    {type: 'bar', x: data.municipality, y: data.number_of_cases, name: data.description},
                ]}
                layout={ {width: 320, height: 240, title: 'A Fancy Plot'} }
            />
        </div>
    );
}