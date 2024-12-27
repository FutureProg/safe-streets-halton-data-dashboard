'use client';
import React from 'react';
import BaseMap from '@/components/BaseMap';
import styles from './page.module.scss';
import MenuPanel from '@/app/_views/MenuPanel';
import SimpleForm from '@/components/SimpleForm';
import FormLabel from '@/components/FormLabel';

import LookupIcon from '@/img/icon-lookup.svg';
import Panel from '@/components/Panel';
import InputText from '@/components/InputText';
import FormElement from '@/components/FormElement';
import CityIcon from '@/img/icon-city.svg';
import CalendarIcon from '@/img/icon-calendar.svg';
import MultiSelect, { Option } from '@/components/MultiSelect';
import Button, { ButtonVariant } from '@/components/Button';
import { Metadata } from 'next';

export default function Home() {

  const cityOptions = [
    {
      "label": "Burlington",
      "value": "burlington"
    },
    {
      "label": "Halton Hills",
      "value": "Halton Hills"
    },
    {
      "label": "Milton",
      "value": "milton"
    },
    {
      "label": "Oakville",
      "value": "oakville"
    },
    {
      "label": "Georgetown",
      "value": "georgetown"
    },
    {
      "label": "Acton",
      "value": "acton"
    }
  ] satisfies Option[];

  return (
    <main>
      <div className={styles.mapContainer}>
        <BaseMap></BaseMap>
      </div>    
      <div className={styles.contentView}>
        <div className={styles.columnContainer}>
          <MenuPanel />
        </div>
        <div></div>
        <div className={styles.columnContainer} style={{alignItems: 'flex-end'}}>
          {/* Lookup by Case ID */}
          <Panel>
            <SimpleForm>
              <FormElement>
                <FormLabel icon={{src: LookupIcon, alt: ""}} htmlFor="caseNumber" >Case Number</FormLabel>
                <InputText id="caseNumber" name="caseNumber" />
              </FormElement>
            </SimpleForm>
          </Panel>

          <form className={styles.filterForm}>
              <FormElement>
                <FormLabel icon={{src: CalendarIcon, alt: ""}} htmlFor="startDate" >Start Date</FormLabel>
                <InputText style={{width: '100%'}} id="startDate" name="startDate" />
              </FormElement>
              <FormElement>
                <FormLabel icon={{src: CalendarIcon, alt: ""}} htmlFor="endDate" >End Date</FormLabel>
                <InputText style={{width: '100%'}} id="endDate" name="endDate" />
              </FormElement>
              <FormElement>
                <FormLabel icon={{src: CityIcon, alt: ""}} htmlFor="city" >Municipality</FormLabel>
                <MultiSelect options={cityOptions} id="city" name="city" />
              </FormElement>
              <div className={styles.buttonRow}>
                <Button variant={ButtonVariant.Primary} type='submit'>Search</Button>
                <Button variant={ButtonVariant.Subtle} type='reset'>Reset</Button>
              </div>              
          </form>

        </div>
      </div>  
    </main>
  );
}
