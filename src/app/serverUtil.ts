'server only';

import { findInfo } from "@/db/db";
import { StaticValues } from "./common";
import { TFunctionNonStrict } from "i18next";

export const getStaticValues = async (translate: TFunctionNonStrict) => {
    return await findInfo().then(({incidents, cities}) => {
        return {
            incidentTypes: incidents?.map(key => ({label: translate(key, {ns: 'staticValues'}), value: key})) ?? [],
            cities: cities?.map(key => ({label: translate(key, {ns: 'staticValues'}), value: key})) ?? []
        } satisfies StaticValues;
    })
}