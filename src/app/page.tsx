import Image from "next/image";
import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import DPlot from '../components/plot';
import { PlotData, Data as PlotlyData } from 'plotly.js';
import * as Api from '@/api';
import { jsonArrayToPlotDataArr } from '@/util';

export default function Home() {
  // const defaultData = [] as Partial<PlotData>[];
  // const [data, setData] = useState(defaultData);
  // ///{type: 'bar', x: data.municipality, y: data.number_of_cases, name: data.description},
  // Api.getAnnualData(2023)    
  //     .then(({data, error, isLoading}) => {                   
  //         if (error) {
  //           throw error;
  //         }
  //         if (!data || isLoading) {
  //           return;
  //         }
  //         console.log(data);   
  //         setData(jsonArrayToPlotDataArr(data, 'bar', 'municipality', 'number_of_cases', 'description'))
  //     });      


  return (
    <main className={styles.main}>
      <h1>Hello, Next.js!</h1>
      <DPlot/>
    </main>
  );
}
