import { CaseData } from "@/common"
import { useState } from "react"
import { Popup } from "react-leaflet"

import styles from '@/components/MapPlot.module.css';
import { useTranslation } from "react-i18next";

export interface MarkerPopupContentProps {
    key: string,
    data: CaseData[]
}

export const MarkerPopupContents = (props: MarkerPopupContentProps) => {

    let {t: tStaticValues} = useTranslation('staticValues');
    const onPageButtonClick = (delta: number) => () => {
        let nPageNum = pageNumber + delta;
        if (nPageNum >= props.data.length) {
            nPageNum = 0;
        }
        else if (nPageNum < 0) {
            nPageNum = props.data.length-1;
        }
        setPageNumber(nPageNum);
    }

    let [pageNumber, setPageNumber] = useState(0);    
    let caseData = props.data[pageNumber];
    // Typically will trigger on a reload
    if (!caseData && props.data.length > 0) {
        caseData = props.data[0];
        setPageNumber(0);
    } else if (!caseData || props.data.length == 0) {
        return (<></>)
    }
    return (
        <Popup key={props.key}>
            <div className={styles.mapPopupContent}>                                
                {props.data.length > 1 ? 
                    (
                        <>
                        <div style={{textAlign:'center'}}>Incident {pageNumber+1} / {props.data.length}</div>
                        <div style={{display: 'flex', flexDirection: "row", justifyContent: "space-evenly"}}>
                            <button onClick={onPageButtonClick(-1)}>Previous</button>                
                            <button onClick={onPageButtonClick(1)}>Next</button>            
                        </div>                
                        </>                
                    ) 
                    : (<></>)
                }
                <table>
                    <tr>
                        <th>Case #</th>
                        <td>{caseData.case_no}</td>
                    </tr>
                    <tr>
                        <th>Municipality</th>
                        <td>{caseData.city}</td>
                    </tr>
                    <tr>
                        <th>Date</th>
                        <td>{caseData.date.toDateString()}</td>
                    </tr>
                    <tr>
                        <th>Time</th>
                        <td>{caseData.date.toTimeString()}</td>
                    </tr>
                    <tr>
                        <th>Incident Code</th>
                        <td>{caseData.description}</td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td>{tStaticValues(caseData.description)}</td>
                    </tr>
                </table> 
            </div>                       
        </Popup>
    )
}