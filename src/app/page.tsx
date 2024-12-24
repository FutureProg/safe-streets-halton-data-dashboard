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

import CalendarIcon from '@/img/icon-calendar.svg';

export default function Home() {

  return (
    <main>
      <div className={styles.mapContainer}>
        <BaseMap></BaseMap>
      </div>    
      <div className={styles.contentView}>
        <div className={styles.columnContainer}>
          <MenuPanel />
        </div>
        <div>
          {/* Empty container */}
        </div>
        <div className={styles.columnContainer} style={{alignItems: 'flex-end'}}>
          <Panel>
            <SimpleForm>
              <FormElement>
                <FormLabel icon={{src: LookupIcon, alt: ""}} htmlFor="caseNumber" >Case Number</FormLabel>
                <InputText id="caseNumber" name="caseNumber" />
              </FormElement>
            </SimpleForm>
          </Panel>

          <Panel style={{width: '100%'}}>
            <form className={styles.filterForm}>
              <FormElement>
                <FormLabel icon={{src: CalendarIcon, alt: ""}} htmlFor="startDate" >Start Date</FormLabel>
                <InputText style={{width: '100%'}} id="startDate" name="startDate" />
              </FormElement>
            </form>
          </Panel>

        </div>
      </div>  
    </main>
  );
}
