'use client';

import { PropsWithChildren } from "react";
import { MapDataContext } from "./_state/MapDataState";

const Providers = ({children}: PropsWithChildren) => {
    return (
        <MapDataContext.Provider>
            {children}
        </MapDataContext.Provider>
    )
}

export default Providers;