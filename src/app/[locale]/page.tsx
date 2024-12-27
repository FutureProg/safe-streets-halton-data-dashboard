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
import MultiSelect, { Option } from '@/components/MultiSelect';
import Button, { ButtonVariant } from '@/components/Button';
import FilterForm from '../_views/FilterForm';

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
          <FilterForm />

        </div>
      </div>  
    </main>
  );
}
