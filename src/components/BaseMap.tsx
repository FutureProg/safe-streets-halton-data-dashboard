'use client';
import 'leaflet/dist/leaflet.css';
import dynamic from "next/dynamic";
import { PropsWithChildren } from 'react';

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const ZoomControl = dynamic(() => import("react-leaflet").then(mod => mod.ZoomControl), { ssr: false });

export const BaseMap = ({children}: PropsWithChildren) => {
    return (
        <MapContainer zoomControl={false} center={[43.5203105, -79.794951]} zoom={11.25} scrollWheelZoom={true} style={{width: '100%', height: '100%'}}>
            <ZoomControl position="bottomright" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {children}
        </MapContainer>
    );
}

export default BaseMap;