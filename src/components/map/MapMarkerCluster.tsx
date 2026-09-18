'use client';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { CaseData } from "@/common";
import { MarkerData } from "@/lib/features/mapData/mapDataSlice";
import MarkerClusterGroup from "react-leaflet-cluster"
import { MarkerPopupContents } from "../MarkerPopupContents";
import { MapDataContext } from "@/app/_state/MapDataState";

import mvcCrashIcon from '@/img/mvc-crash-icon.png';
import L from "leaflet";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { ClientSideFilters } from "@/app/common";

const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default () => {
    const data: MarkerData[] = MapDataContext.useSelector((snapshot) => {
        if (snapshot.matches("success")) {
            return snapshot.context.markerData ?? [];
        }
        return [];
    });

    const filters : ClientSideFilters = MapDataContext.useSelector((snapshot) => {
        if (snapshot.matches('idle')  || snapshot.matches('success')) {
            return snapshot.context.clientFilters ?? {incidentTypes: []};
        }
        return {incidentTypes: []};
    })

    const markerIcon = useMemo(() => new L.Icon({
        iconUrl: mvcCrashIcon.src,
        iconRetinaUrl: mvcCrashIcon.src,
        iconSize: [32, 45],
        iconAnchor: [16, 45],
        popupAnchor: [0, -45]
    }), []);

    const items = useMemo(() => data
        .map((markerData: MarkerData) => { // apply local filters
            let re = {...markerData, caseData: [] as CaseData[]};
            re.caseData = markerData.caseData.filter((value) => filters.incidentTypes.indexOf(value.description) >= 0) ?? [];
            return re;
        })
        .filter((val: MarkerData) => val.caseData.length > 0)
        .map((markerData: MarkerData) => ( // create marker
            <Marker position={markerData.position} key={'Marker-' + markerData.position} icon={markerIcon}>
                {markerData.popupText? (<MarkerPopupContents key={'Popup-' + markerData.position} data={markerData.caseData}/>) : (<></>)}
            </Marker>
        )), [data, filters, markerIcon]);

    return (
        <>
            {items.length > 0? (
            <MarkerClusterGroup chunkedLoading>
                {items}         
            </MarkerClusterGroup>) 
            : null
            }
        </>
    )
}