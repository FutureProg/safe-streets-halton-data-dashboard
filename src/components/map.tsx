"use client";

import { MapContainer, TileLayer } from "react-leaflet";

export default () => {
    return (
        <MapContainer
            center={[43.5203105, -79.794951]}
            zoom={11.25}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
    );
}