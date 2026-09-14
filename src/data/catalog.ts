import type { Phone } from '../engine/types'

/** Catalogo local ~20 moviles mercado UE / Espana (precios orientativos) */
export const PHONE_CATALOG: Phone[] = [
  {
    id: 'redmi-note-13',
    name: 'Redmi Note 13',
    brand: 'Xiaomi',
    priceEuro: 199,
    capabilities: {
      soc: 45, pantalla: 55, camara: 50, storage: 50, ram: 50,
      bateria: 70, conectividad: 45, audio: 40, sensores: 45, software: 40,
    },
    highlights: ['Gran bateria a precio asequible'],
  },
  {
    id: 'samsung-a35',
    name: 'Galaxy A35',
    brand: 'Samsung',
    priceEuro: 329,
    capabilities: {
      soc: 55, pantalla: 65, camara: 58, storage: 55, ram: 55,
      bateria: 65, conectividad: 55, audio: 50, sensores: 55, software: 70,
    },
    highlights: ['Actualizaciones largas de Samsung'],
  },
  {
    id: 'pixel-8a',
    name: 'Pixel 8a',
    brand: 'Google',
    priceEuro: 449,
    capabilities: {
      soc: 70, pantalla: 70, camara: 85, storage: 55, ram: 60,
      bateria: 60, conectividad: 65, audio: 55, sensores: 60, software: 90,
    },
    highlights: ['Mejor camara de su rango con IA de Google'],
  },
  {
    id: 'nothing-phone-2a',
    name: 'Nothing Phone (2a)',
    brand: 'Nothing',
    priceEuro: 349,
    capabilities: {
      soc: 62, pantalla: 68, camara: 55, storage: 55, ram: 60,
      bateria: 68, conectividad: 55, audio: 60, sensores: 50, software: 65,
    },
    highlights: ['Diseno distintivo y software limpio'],
  },
  {
    id: 'motorola-edge-50-fusion',
    name: 'Edge 50 Fusion',
    brand: 'Motorola',
    priceEuro: 379,
    capabilities: {
      soc: 60, pantalla: 72, camara: 62, storage: 55, ram: 58,
      bateria: 72, conectividad: 55, audio: 55, sensores: 52, software: 55,
    },
    highlights: ['Pantalla curva y carga rapida'],
  },
  {
    id: 'samsung-a55',
    name: 'Galaxy A55',
    brand: 'Samsung',
    priceEuro: 429,
    capabilities: {
      soc: 62, pantalla: 72, camara: 65, storage: 60, ram: 62,
      bateria: 68, conectividad: 60, audio: 55, sensores: 60, software: 75,
    },
    highlights: ['Equilibrio gama media con IP67'],
  },
  {
    id: 'poco-x6-pro',
    name: 'POCO X6 Pro',
    brand: 'Xiaomi',
    priceEuro: 379,
    capabilities: {
      soc: 82, pantalla: 75, camara: 55, storage: 65, ram: 75,
      bateria: 65, conectividad: 55, audio: 50, sensores: 50, software: 45,
    },
    highlights: ['SoC potente ideal para gaming'],
  },
  {
    id: 'realme-12-pro-plus',
    name: 'realme 12 Pro+',
    brand: 'realme',
    priceEuro: 449,
    capabilities: {
      soc: 65, pantalla: 70, camara: 78, storage: 60, ram: 60,
      bateria: 65, conectividad: 55, audio: 55, sensores: 55, software: 50,
    },
    highlights: ['Teleobjetivo periscopio a precio medio'],
  },
  {
    id: 'honor-200',
    name: 'HONOR 200',
    brand: 'HONOR',
    priceEuro: 499,
    capabilities: {
      soc: 68, pantalla: 75, camara: 80, storage: 60, ram: 65,
      bateria: 70, conectividad: 58, audio: 55, sensores: 55, software: 55,
    },
    highlights: ['Retrato tipo estudio a buen precio'],
  },
  {
    id: 'pixel-9',
    name: 'Pixel 9',
    brand: 'Google',
    priceEuro: 799,
    capabilities: {
      soc: 80, pantalla: 82, camara: 92, storage: 65, ram: 72,
      bateria: 68, conectividad: 75, audio: 65, sensores: 70, software: 95,
    },
    highlights: ['Software y camara de referencia'],
  },
  {
    id: 'samsung-s24',
    name: 'Galaxy S24',
    brand: 'Samsung',
    priceEuro: 749,
    capabilities: {
      soc: 88, pantalla: 88, camara: 82, storage: 70, ram: 75,
      bateria: 70, conectividad: 80, audio: 70, sensores: 75, software: 85,
    },
    highlights: ['Flagship compacto con IA Galaxy'],
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    brand: 'Apple',
    priceEuro: 959,
    capabilities: {
      soc: 95, pantalla: 85, camara: 88, storage: 60, ram: 70,
      bateria: 75, conectividad: 80, audio: 75, sensores: 80, software: 95,
    },
    highlights: ['Ecosistema Apple y soporte largo'],
  },
  {
    id: 'oneplus-nord-4',
    name: 'OnePlus Nord 4',
    brand: 'OnePlus',
    priceEuro: 479,
    capabilities: {
      soc: 78, pantalla: 75, camara: 60, storage: 70, ram: 75,
      bateria: 72, conectividad: 65, audio: 60, sensores: 55, software: 60,
    },
    highlights: ['Chasis metalico y carga 100W'],
  },
  {
    id: 'cmf-phone-1',
    name: 'CMF Phone 1',
    brand: 'Nothing',
    priceEuro: 219,
    capabilities: {
      soc: 48, pantalla: 50, camara: 45, storage: 50, ram: 50,
      bateria: 65, conectividad: 45, audio: 45, sensores: 40, software: 55,
    },
    highlights: ['Modulares y precio muy contenido'],
  },
  {
    id: 'xiaomi-14t',
    name: 'Xiaomi 14T',
    brand: 'Xiaomi',
    priceEuro: 549,
    capabilities: {
      soc: 78, pantalla: 80, camara: 82, storage: 65, ram: 70,
      bateria: 70, conectividad: 70, audio: 60, sensores: 60, software: 55,
    },
    highlights: ['Leica y pantalla AMOLED brillante'],
  },
  {
    id: 'samsung-a25',
    name: 'Galaxy A25',
    brand: 'Samsung',
    priceEuro: 279,
    capabilities: {
      soc: 48, pantalla: 60, camara: 52, storage: 50, ram: 50,
      bateria: 62, conectividad: 50, audio: 45, sensores: 50, software: 65,
    },
    highlights: ['Entrada solida al ecosistema Galaxy'],
  },
  {
    id: 'vivo-v40',
    name: 'vivo V40',
    brand: 'vivo',
    priceEuro: 549,
    capabilities: {
      soc: 65, pantalla: 72, camara: 85, storage: 60, ram: 62,
      bateria: 68, conectividad: 55, audio: 55, sensores: 55, software: 50,
    },
    highlights: ['Enfoque en selfie y retrato'],
  },
  {
    id: 'fairphone-5',
    name: 'Fairphone 5',
    brand: 'Fairphone',
    priceEuro: 699,
    capabilities: {
      soc: 55, pantalla: 60, camara: 55, storage: 55, ram: 55,
      bateria: 60, conectividad: 60, audio: 45, sensores: 50, software: 80,
    },
    highlights: ['Reparable y con etica de materiales'],
  },
  {
    id: 'asus-rog-8',
    name: 'ROG Phone 8',
    brand: 'ASUS',
    priceEuro: 999,
    capabilities: {
      soc: 98, pantalla: 90, camara: 60, storage: 80, ram: 95,
      bateria: 85, conectividad: 75, audio: 80, sensores: 65, software: 50,
    },
    highlights: ['Bestia gaming con refrigeracion activa'],
  },
  {
    id: 'google-pixel-9a',
    name: 'Pixel 9a',
    brand: 'Google',
    priceEuro: 499,
    capabilities: {
      soc: 72, pantalla: 72, camara: 86, storage: 55, ram: 62,
      bateria: 65, conectividad: 68, audio: 55, sensores: 62, software: 92,
    },
    highlights: ['Camara Pixel a precio mas asequible'],
  },
  {
    id: 'samsung-s24-fe',
    name: 'Galaxy S24 FE',
    brand: 'Samsung',
    priceEuro: 649,
    capabilities: {
      soc: 80, pantalla: 82, camara: 75, storage: 65, ram: 70,
      bateria: 72, conectividad: 75, audio: 65, sensores: 70, software: 80,
    },
    highlights: ['Flagship Experience a menor precio'],
  },
  {
    id: 'oppo-reno12',
    name: 'OPPO Reno12',
    brand: 'OPPO',
    priceEuro: 499,
    capabilities: {
      soc: 68, pantalla: 74, camara: 72, storage: 60, ram: 65,
      bateria: 70, conectividad: 58, audio: 55, sensores: 55, software: 55,
    },
    highlights: ['Diseno fino y carga rapida'],
  },
]
