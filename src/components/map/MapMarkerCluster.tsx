'use client';
import { CaseData } from "@/common";
import { MarkerData } from "@/lib/features/mapData/mapDataSlice";
import MarkerClusterGroup from "react-leaflet-cluster"
import { MarkerPopupContents } from "../MarkerPopupContents";
import { MapDataContext } from "@/app/_state/MapDataState";

import mvcCrashIcon from '@/img/mvc-crash-icon.png';
import L from "leaflet";
import dynamic from "next/dynamic";

const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default () => {
    const data: MarkerData[] = MapDataContext.useSelector((snapshot) => {
        if (snapshot.matches("success")) {
            return snapshot.context.markerData ?? [];
        }
        return [];
    });

    let markerIcon = new L.Icon({
        iconUrl: mvcCrashIcon.src,
        iconRetinaUrl: mvcCrashIcon.src,        
        iconSize: [32, 45],
        iconAnchor: [16, 45],
        popupAnchor: [0, -45]
    });

    let items = data
    .map((markerData: MarkerData) => { // apply local filters
        let re = {...markerData, caseData: [] as CaseData[]};        
        re.caseData = markerData.caseData ?? [];//.filter((value) => localFilters.description.indexOf(value.description) >= 0);
        return re;
    })
    .filter((val: any) => val.caseData.length > 0)
    .map((markerData: MarkerData) => ( // create marker
        <Marker position={markerData.position} key={'Marker-' + markerData.position} icon={markerIcon}>
            {markerData.popupText? (<MarkerPopupContents key={'Popup-' + markerData.position} data={markerData.caseData}/>) : (<></>)}
        </Marker>
    ));

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