import Image from "next/image";
import React, { useState, useEffect } from 'react';
// import styles from "./page.module.css";
import './homepage.css';
import dynamic from "next/dynamic";
import ChartPlot from '../components/ChartPlot';
import { PlotData, Data as PlotlyData } from 'plotly.js';
import * as Api from '@/api';
import { jsonArrayToPlotDataArr } from '@/util';
import PlotContainer from "@/components/PlotContainer";
import MapPlot from "@/components/MapPlot";
import DataTable from "@/components/DataTable";

export default function Home() { 

  const Map = React.useMemo( () => dynamic(
    () => import('@/components/MapPlot'),
    { ssr: false }
  ), []);

  return (
    <main>
      <PlotContainer>
        <ChartPlot/>   
        <Map/>
        <DataTable/>
      </PlotContainer>         
    </main>
  );
}
