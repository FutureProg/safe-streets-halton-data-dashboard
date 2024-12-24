import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import Head from "next/head";
import { LayoutContextProvider } from "@/contexts/LayoutContextProvider";
import '@/i18n';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Safe Street Dashboard [Beta]",
  description: "visualize traffic safety data in Halton Region",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (    
    <html lang="en">
      <Head>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""/>
      </Head>
      <body className={inter.className}>
        <StoreProvider>
          <LayoutContextProvider>
            {/* <span style={{marginLeft: '8px'}}>
              <b>Note:</b> HRPS data does duplicate cases, and often provides inaccurate & different locations. Map markers indicate the incident occured in the general vicinity.
            </span> */}
            {children}
          </LayoutContextProvider>          
        </StoreProvider>        
      </body>
    </html>
  );
}
