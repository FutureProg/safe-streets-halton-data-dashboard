import React, * as ReactLib from "react";

export type DataPlot = React.ReactElement;


/**
 * Typedef for styles of the MultiSelectDropdown component, from https://www.npmjs.com/package/multiselect-react-dropdown
 */
export interface MultiSelectStyles {
    multiselectContainer: ReactLib.CSSProperties
    searchBox: ReactLib.CSSProperties
    inputField: ReactLib.CSSProperties
    chips: ReactLib.CSSProperties
    optionContainer: ReactLib.CSSProperties
    option: ReactLib.CSSProperties,
    groupHeading: ReactLib.CSSProperties
  }