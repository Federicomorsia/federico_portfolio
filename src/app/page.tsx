import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { asText, Content } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { getHomepage } from "@/prismicio";
import { components } from "@/slices";
import Header from "@/components/header";
import ISRDebug from "@/components/ISRDebug";
import ProjectsListWrapper from "@/components/ProjectsListWrapper";
import DrawingCanvas from "@/components/DrawingCanvas";

/**
 * Homepage del sito con supporto ISR
 * 
 * Questa pagina:
 * - Usa getHomepage() per recuperare i dati da Prismic
 * - È configurata per ISR (Incremental Static Regeneration)
 * - Viene automaticamente revalidata tramite webhook
 * - Ha fallback per gestire errori di fetch
 */
export default async function Home() {
  // Fetch dei dati della homepage usando la helper function
  const home = await getHomepage();

  // Gestisci il caso in cui la homepage non esista
  if (!home) {
    console.error('❌ Homepage non trovata in Prismic');
    notFound();
  }

  // Filter out both header and footer slices since header is now shown manually
  const contentSlices = home.data.slices.filter((slice) => 
    slice.slice_type !== 'footer' && slice.slice_type !== 'header'
  );

  // Check if there are any projectslist slices
  const projectSlices = contentSlices.filter((slice) => slice.slice_type === 'projectslist');
  const otherSlices = contentSlices.filter((slice) => slice.slice_type !== 'projectslist');

  return (
    <>
      <DrawingCanvas />
      <Header />
      {/* Render other slices first */}
      {otherSlices.length > 0 && <SliceZone slices={otherSlices} components={components} />}
      
      {/* Render projects with wrapper if there are any */}
      {projectSlices.length > 0 && <ProjectsListWrapper projects={projectSlices as Content.ProjectslistSlice[]} />}
      
      <ISRDebug 
        pageType="homepage" 
        lastUpdated={home.last_publication_date}
      />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  // Fetch dei dati per i metadati usando la helper function
  const home = await getHomepage();

  // Fallback metadata se non riusciamo a recuperare i dati
  if (!home) {
    return {
      title: 'Federico Morsia Portfolio',
      description: 'Portfolio personale di Federico Morsia',
    };
  }

  return {
    title: asText(home.data.title),
    description: home.data.meta_description,
    openGraph: {
      title: home.data.meta_title ?? undefined,
      images: [{ url: home.data.meta_image.url ?? "" }],
    },
  };
}

// ========================================
// CONFIGURAZIONE ISR
// ========================================

/**
 * Configurazione per l'ISR (Incremental Static Regeneration)
 * 
 * revalidate: 60 - La pagina viene rigenerata al massimo ogni 60 secondi
 * se ci sono nuove richieste dopo quel periodo.
 * 
 * Questa configurazione combinata con il webhook di Prismic garantisce:
 * - Aggiornamenti immediati quando il contenuto cambia (via webhook)
 * - Fallback ogni 60 secondi per sicurezza
 * - Performance ottimali per gli utenti
 */
export const revalidate = 60;