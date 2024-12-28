import type { Metadata } from "next";
import { Inter, Poppins} from "next/font/google";
import "../globals.css";
import StoreProvider from "../StoreProvider";
import Head from "next/head";
import { LayoutContextProvider } from "@/contexts/LayoutContextProvider";
import TranslationProvider from "../TranslationProvider";
import initTranslations from "../i18n";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"]
});

export const generateMetadata = async ({locale}: {locale: string}) => {
  const {t} = await initTranslations(locale, i18nNamespaces);;
  return {
    title: t("AppName"),
    description: "visualize traffic safety data in Halton Region"
  };
}

const i18nNamespaces = ['translations']

export default async function RootLayout({
  children, params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const {resources} = await initTranslations(locale, i18nNamespaces);

  return (    
    <html lang={locale}>
      <Head>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""/>
      </Head>
      <body className={poppins.className}>
        <StoreProvider>
          <LayoutContextProvider>
            <TranslationProvider
              namespaces={i18nNamespaces}
              locale={locale}
              resources={resources}
            >
              {children}
            </TranslationProvider>
            {/* <span style={{marginLeft: '8px'}}>
              <b>Note:</b> HRPS data does duplicate cases, and often provides inaccurate & different locations. Map markers indicate the incident occured in the general vicinity.
            </span> */}
          </LayoutContextProvider>          
        </StoreProvider>        
      </body>
    </html>
  );
}
