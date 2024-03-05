import Image from "next/image";
import { useState, useEffect } from 'react';
// import styles from "./page.module.css";
import './homepage.css';
import dynamic from "next/dynamic";
import DPlot from '../components/plot';
import { PlotData, Data as PlotlyData } from 'plotly.js';
import * as Api from '@/api';
import { jsonArrayToPlotDataArr } from '@/util';
import FormContainer from "@/components/plotcontainer";

export default function Home() { 
  return (
    <main>
      <FormContainer>
        <DPlot/>   
      </FormContainer>         
    </main>
  );
}
