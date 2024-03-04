'use client'
import Image from "next/image";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import DPlot from '../components/plot';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Hello, Next.js!</h1>
      <DPlot/>
    </main>
  );
}
