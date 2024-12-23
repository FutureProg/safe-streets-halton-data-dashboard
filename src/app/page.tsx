'use client';
import React from 'react';
import BaseMap from '@/components/BaseMap';
import styles from './page.module.scss';
import Panel from '@/components/Panel';
import ToggleButton from '@/components/ToggleButton';

import MenuToggleIcon from '@/img/bars.svg';
import Image from 'next/image';

export default function Home() {

  const menuIcon = <Image priority src={MenuToggleIcon} alt='Menu button' width='18' height='18' />;

  return (
    <main>
      <div className={styles.mapContainer}>
        <BaseMap></BaseMap>
      </div>    
      <div className={styles.contentView}>
        <div className={styles.columnContainer}>
          <Panel>
            <div className={styles.menuPanel}>
              <span className={styles.title}>Safe Streets Dashboard</span>
              <ToggleButton icon={menuIcon} alt='Menu button' aria-haspopup='menu' aria-controls='menu-popup' aria-expanded='false'></ToggleButton>
            </div>
          </Panel>
        </div>
      </div>  
    </main>
  );
}
