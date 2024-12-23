'use client';
import React from 'react';
// import styles from "./page.module.css";
import Map from '@/components/MapPlot'
import './homepage.css';
import ChartPlot from '../components/ChartPlot';
import PlotContainer from "@/components/plotcontainer";
import DataTable from "@/components/DataTable";

export default function Home() { 

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
