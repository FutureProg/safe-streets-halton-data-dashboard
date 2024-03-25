import Image from "next/image";
import { useState, useEffect } from 'react';
// import styles from "./page.module.css";
import './homepage.css';
import dynamic from "next/dynamic";
import ChartPlot from '../components/ChartPlot';
import { PlotData, Data as PlotlyData } from 'plotly.js';
import * as Api from '@/api';
import { jsonArrayToPlotDataArr } from '@/util';
import PlotContainer from "@/components/PlotContainer";

export default function Home() { 
  return (
    <main>
      <PlotContainer>
        <ChartPlot/>   
      </PlotContainer>         
    </main>
  );
}
