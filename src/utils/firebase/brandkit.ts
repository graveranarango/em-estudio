import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, getNetworkState } from './config';

export interface BrandKitData {
  colors: Array<{ name: string; hex: string; usage: string; type?: 'primary' | 'secondary' | 'alternative' }>;
  typography: Array<{ name: string; font: string; weight: string; size: string; usage: string }>;
  logos: Array<{ name: string; type: string; format: string; description: string; url?: string }>;
  visualStyle: {
    iconStyle: string;
    illustrations: string;
    photography: string;
    patterns: string;
  };
  voiceTone: {
    personality: string;
    tone: string;
    language: string;
    examples: string[];
  };
  usageRules: {
    dos: string[];
    donts: string[];
  };
  analysisInfo?: {
    confidence?: number;
    processingTime?: string;
    extractedBy?: string;
  };
  metadata?: {
    createdAt: any;
    updatedAt: any;
    version: string;
  };
}

const COMPANY_ID = "company_001"; // ID fijo para ejemplo
const COLLECTION_NAME = "brandkits";

/**
 * Guarda o actualiza el BrandKit en Firestore
 */
export async function saveBrandKit(data: BrandKitData): Promise<void> {
  try {
    // Check network state before attempting to save
    const networkState = getNetworkState();
    
    if (networkState.isOffline) {
      console.warn("Offline mode detected, unable to save BrandKit to Firestore");
      throw new Error("Client is offline - unable to save to Firestore");
    }

    const docRef = doc(db, COLLECTION_NAME, COMPANY_ID);
    
    // Agregar metadata de timestamp
    const brandKitWithMetadata: BrandKitData = {
      ...data,
      metadata: {
        createdAt: data.metadata?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        version: "1.0"
      }
    };

    await setDoc(docRef, brandKitWithMetadata, { merge: true });
    console.log("BrandKit guardado exitosamente en Firestore");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const isNetworkError = errorMessage.includes('offline') || 
                          errorMessage.includes('unavailable') || 
                          errorMessage.includes('transport errored');

    if (isNetworkError) {
      console.warn("Network error while saving BrandKit:", errorMessage);
      throw new Error(`offline: Unable to save while offline - ${errorMessage}`);
    }

    console.error("Error guardando BrandKit:", error);
    throw new Error(`No se pudo guardar el BrandKit: ${errorMessage}`);
  }
}

/**
 * Carga el BrandKit desde Firestore
 */
export async function loadBrandKit(): Promise<BrandKitData | null> {
  try {
    // Check network state before attempting connection
    const networkState = getNetworkState();
    
    if (networkState.isOffline) {
      console.warn("Offline mode detected, unable to load BrandKit from Firestore");
      throw new Error("Client is offline - unable to fetch from Firestore");
    }

    const docRef = doc(db, COLLECTION_NAME, COMPANY_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as BrandKitData;
      console.log("BrandKit cargado desde Firestore:", data);
      return data;
    } else {
      console.log("No se encontró BrandKit en Firestore");
      return null;
    }
  } catch (error) {
    // Check if it's a network-related error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const isNetworkError = errorMessage.includes('offline') || 
                          errorMessage.includes('unavailable') || 
                          errorMessage.includes('transport errored') ||
                          errorMessage.includes('Failed to get document');

    if (isNetworkError) {
      console.warn("Network error detected while loading BrandKit:", errorMessage);
      throw new Error(`offline: ${errorMessage}`);
    }

    console.error("Error cargando BrandKit:", error);
    throw new Error(`No se pudo cargar el BrandKit: ${errorMessage}`);
  }
}

/**
 * Verifica si existe un BrandKit en Firestore
 */
export async function brandKitExists(): Promise<boolean> {
  try {
    // Check network state before attempting connection
    const networkState = getNetworkState();
    
    if (networkState.isOffline) {
      console.warn("Offline mode detected, cannot verify BrandKit existence");
      return false; // Assume doesn't exist in offline mode
    }

    const docRef = doc(db, COLLECTION_NAME, COMPANY_ID);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const isNetworkError = errorMessage.includes('offline') || 
                          errorMessage.includes('unavailable') || 
                          errorMessage.includes('transport errored');

    if (isNetworkError) {
      console.warn("Network error while checking BrandKit existence:", errorMessage);
      return false; // Return false for network errors
    }

    console.error("Error verificando existencia del BrandKit:", error);
    return false;
  }
}

/**
 * Formatea la fecha de última actualización
 */
export function formatLastUpdated(timestamp: any): string {
  if (!timestamp) return "Fecha no disponible";
  
  try {
    // Si es un Timestamp de Firestore
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    
    // Si es una fecha normal
    if (timestamp instanceof Date) {
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(timestamp);
    }
    
    return "Fecha no válida";
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "Error en fecha";
  }
}