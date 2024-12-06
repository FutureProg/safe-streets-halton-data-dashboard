import React from 'react';
// import styles from "./page.module.css";
import './homepage.css';
import dynamic from "next/dynamic";
import ChartPlot from '../components/ChartPlot';
import PlotContainer from "@/components/plotcontainer";
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
