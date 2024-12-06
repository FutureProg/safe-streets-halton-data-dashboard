'use client'
import { Suspense, useMemo } from "react";
import styles from "./page.module.css";
import dynamic from "next/dynamic";

export default function Home() {
  const MapView = useMemo(() => dynamic( () => import('../components/map.tsx'), {ssr: false}), []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <MapView />
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
