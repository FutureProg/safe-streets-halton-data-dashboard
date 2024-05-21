'use client'
import dynamic from "next/dynamic";
import { DataPlot } from "@/types";

import styles from "./MapPlot.module.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useContext, useEffect } from "react";
import { CaseData, LoadState, caseDataToHTML } from "@/common";
import { LoadDataThunkParams, MarkerData, loadData } from "@/lib/features/mapData/mapDataSlice";
import { selectFilters } from "@/lib/features/filters/filtersSlice";
import MarkerClusterGroup from "react-leaflet-cluster";

import mvcCrashIcon from '@/img/mvc-crash-icon.png';
import L, { divIcon } from "leaflet";
import { MarkerPopupContents } from "./MarkerPopupContents";
import { LocalFilterContext, LocalFilterType } from "@/contexts/LocalFilterContext";

export const MapPlot = () : DataPlot => {
    let localFilters = useContext(LocalFilterContext);

    let {loadState, data, error} = useAppSelector((state) => state.mapData);
    let filters = useAppSelector(selectFilters)
    let dispatch = useAppDispatch();
    useEffect(() => {
        if (loadState == LoadState.None) {            
            let params : LoadDataThunkParams = {
                start_date: new Date(filters.year, 0, 1),
                end_date: new Date(filters.year, 11, 31),
                excluded_cities: filters.excluded_cities                
            };
            dispatch(loadData(params));
        }
    }, [dispatch, loadState, filters]);    

    let markerIcon = new L.Icon({
        iconUrl: mvcCrashIcon.src,
        iconRetinaUrl: mvcCrashIcon.src,        
        iconSize: [32, 45],
        iconAnchor: [16, 45],
        popupAnchor: [0, -45]
    })

    let items = data
    .map((markerData: MarkerData) => { // apply local filters
        let re = {...markerData, caseData: [] as CaseData[]};        
        re.caseData = markerData.caseData.filter((value) => localFilters.description.indexOf(value.description) >= 0);
        return re;
    })
    .filter((val) => val.caseData.length > 0)
    .map((markerData: MarkerData) => ( // create marker
        <Marker position={markerData.position} key={'Marker-' + markerData.position} icon={markerIcon}>
            {markerData.popupText? (<MarkerPopupContents key={'Popup-' + markerData.position} data={markerData.caseData}/>) : (<></>)}
        </Marker>
    ));

    return (
        <div className={styles.mapPlot}>            
            {loadState !== LoadState.Loaded? <div className={styles.mapPlotLoadStatus}><p>{loadState == LoadState.Error? "Error" : "Loading"}</p></div> : <></>}
            <MapContainer center={[43.5203105, -79.794951]} zoom={11.25} scrollWheelZoom={true} style={{width: '100%', height: '100%'}}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>       
                <MarkerClusterGroup chunkedLoading>
                    {items}         
                </MarkerClusterGroup>                
            </MapContainer>
        </div>
    )
};

export default MapPlot;