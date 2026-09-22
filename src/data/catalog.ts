import type { Phone } from '../engine/types'

/**
 * Catálogo local ~38 móviles reconocibles en España / UE (2025–2026).
 * Precios orientativos de catálogo UE — no son precios en vivo de tiendas.
 */
export const PHONE_CATALOG: Phone[] = [
  {
    id: 'redmi-14c',
    name: 'Redmi 14C',
    brand: 'Xiaomi',
    priceEuro: 129,
    capabilities: {
      soc: 35, pantalla: 42, camara: 38, storage: 40, ram: 40,
      bateria: 65, conectividad: 40, audio: 35, sensores: 35, software: 35,
    },
    highlights: ['Entrada muy asequible con buena batería'],
  },
  {
    id: 'samsung-a16',
    name: 'Galaxy A16',
    brand: 'Samsung',
    priceEuro: 199,
    capabilities: {
      soc: 42, pantalla: 55, camara: 48, storage: 48, ram: 48,
      bateria: 62, conectividad: 48, audio: 42, sensores: 48, software: 68,
    },
    highlights: ['Actualizaciones largas a precio de entrada'],
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
    id: 'redmi-note-14',
    name: 'Redmi Note 14',
    brand: 'Xiaomi',
    priceEuro: 229,
    capabilities: {
      soc: 50, pantalla: 62, camara: 55, storage: 55, ram: 55,
      bateria: 75, conectividad: 50, audio: 42, sensores: 48, software: 42,
    },
    highlights: ['Gran batería y AMOLED a buen precio'],
  },
  {
    id: 'motorola-g85',
    name: 'moto g85',
    brand: 'Motorola',
    priceEuro: 249,
    capabilities: {
      soc: 52, pantalla: 68, camara: 55, storage: 55, ram: 55,
      bateria: 70, conectividad: 50, audio: 50, sensores: 48, software: 52,
    },
    highlights: ['Pantalla pOLED curva en gama media baja'],
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
    highlights: ['Entrada sólida al ecosistema Galaxy'],
  },
  {
    id: 'realme-13',
    name: 'realme 13',
    brand: 'realme',
    priceEuro: 279,
    capabilities: {
      soc: 55, pantalla: 62, camara: 55, storage: 55, ram: 55,
      bateria: 72, conectividad: 50, audio: 48, sensores: 48, software: 48,
    },
    highlights: ['Carga rápida y pantalla fluida'],
  },
  {
    id: 'nothing-phone-3a',
    name: 'Nothing Phone (3a)',
    brand: 'Nothing',
    priceEuro: 329,
    capabilities: {
      soc: 62, pantalla: 70, camara: 68, storage: 55, ram: 62,
      bateria: 70, conectividad: 58, audio: 58, sensores: 52, software: 68,
    },
    highlights: ['Glyph y cámara con carácter a precio medio'],
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
    id: 'poco-x7',
    name: 'POCO X7',
    brand: 'Xiaomi',
    priceEuro: 329,
    capabilities: {
      soc: 72, pantalla: 72, camara: 55, storage: 60, ram: 68,
      bateria: 72, conectividad: 55, audio: 50, sensores: 50, software: 45,
    },
    highlights: ['Rendimiento alto sin pagar flagship'],
  },
  {
    id: 'cmf-phone-2-pro',
    name: 'CMF Phone 2 Pro',
    brand: 'Nothing',
    priceEuro: 349,
    capabilities: {
      soc: 58, pantalla: 65, camara: 62, storage: 58, ram: 60,
      bateria: 72, conectividad: 52, audio: 50, sensores: 48, software: 60,
    },
    highlights: ['Más cámara y batería en la línea CMF'],
  },
  {
    id: 'motorola-edge-50-fusion',
    name: 'Edge 50 Fusion',
    brand: 'Motorola',
    priceEuro: 349,
    capabilities: {
      soc: 60, pantalla: 72, camara: 62, storage: 55, ram: 58,
      bateria: 72, conectividad: 55, audio: 55, sensores: 52, software: 55,
    },
    highlights: ['Pantalla curva y carga rápida'],
  },
  {
    id: 'samsung-a36',
    name: 'Galaxy A36',
    brand: 'Samsung',
    priceEuro: 379,
    capabilities: {
      soc: 58, pantalla: 70, camara: 62, storage: 58, ram: 58,
      bateria: 68, conectividad: 58, audio: 52, sensores: 58, software: 75,
    },
    highlights: ['IP67 y años de One UI en gama media'],
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
    id: 'oneplus-nord-ce4',
    name: 'OnePlus Nord CE4',
    brand: 'OnePlus',
    priceEuro: 399,
    capabilities: {
      soc: 70, pantalla: 72, camara: 58, storage: 62, ram: 68,
      bateria: 75, conectividad: 60, audio: 55, sensores: 52, software: 58,
    },
    highlights: ['Carga 100W y OxygenOS fluido'],
  },
  {
    id: 'google-pixel-8a',
    name: 'Pixel 8a',
    brand: 'Google',
    priceEuro: 399,
    capabilities: {
      soc: 70, pantalla: 70, camara: 85, storage: 55, ram: 60,
      bateria: 60, conectividad: 65, audio: 55, sensores: 60, software: 90,
    },
    highlights: ['Mejor cámara de su rango con IA de Google'],
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
    id: 'honor-200',
    name: 'HONOR 200',
    brand: 'HONOR',
    priceEuro: 449,
    capabilities: {
      soc: 68, pantalla: 75, camara: 80, storage: 60, ram: 65,
      bateria: 70, conectividad: 58, audio: 55, sensores: 55, software: 55,
    },
    highlights: ['Retrato tipo estudio a buen precio'],
  },
  {
    id: 'realme-13-pro-plus',
    name: 'realme 13 Pro+',
    brand: 'realme',
    priceEuro: 449,
    capabilities: {
      soc: 68, pantalla: 72, camara: 82, storage: 62, ram: 65,
      bateria: 68, conectividad: 58, audio: 55, sensores: 55, software: 50,
    },
    highlights: ['Teleobjetivo periscopio en gama media'],
  },
  {
    id: 'oppo-reno13',
    name: 'OPPO Reno13',
    brand: 'OPPO',
    priceEuro: 479,
    capabilities: {
      soc: 70, pantalla: 76, camara: 74, storage: 62, ram: 68,
      bateria: 72, conectividad: 60, audio: 58, sensores: 55, software: 58,
    },
    highlights: ['Diseño fino y carga rápida'],
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
    highlights: ['Chasis metálico y carga 100W'],
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
    highlights: ['Cámara Pixel a precio más asequible'],
  },
  {
    id: 'samsung-a56',
    name: 'Galaxy A56',
    brand: 'Samsung',
    priceEuro: 499,
    capabilities: {
      soc: 68, pantalla: 75, camara: 70, storage: 65, ram: 68,
      bateria: 70, conectividad: 65, audio: 58, sensores: 65, software: 78,
    },
    highlights: ['Gama media alta con Galaxy AI'],
  },
  {
    id: 'poco-f6',
    name: 'POCO F6',
    brand: 'Xiaomi',
    priceEuro: 449,
    capabilities: {
      soc: 88, pantalla: 80, camara: 58, storage: 70, ram: 80,
      bateria: 70, conectividad: 60, audio: 55, sensores: 52, software: 48,
    },
    highlights: ['Flagship killer para juegos'],
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
    id: 'oneplus-13r',
    name: 'OnePlus 13R',
    brand: 'OnePlus',
    priceEuro: 599,
    capabilities: {
      soc: 85, pantalla: 82, camara: 68, storage: 72, ram: 80,
      bateria: 80, conectividad: 70, audio: 62, sensores: 60, software: 65,
    },
    highlights: ['Flagship-lite con batería enorme'],
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
    id: 'google-pixel-9',
    name: 'Pixel 9',
    brand: 'Google',
    priceEuro: 749,
    capabilities: {
      soc: 80, pantalla: 82, camara: 92, storage: 65, ram: 72,
      bateria: 68, conectividad: 75, audio: 65, sensores: 70, software: 95,
    },
    highlights: ['Software y cámara de referencia'],
  },
  {
    id: 'samsung-s25',
    name: 'Galaxy S25',
    brand: 'Samsung',
    priceEuro: 799,
    capabilities: {
      soc: 92, pantalla: 90, camara: 85, storage: 72, ram: 78,
      bateria: 72, conectividad: 82, audio: 72, sensores: 78, software: 88,
    },
    highlights: ['Flagship compacto con Galaxy AI'],
  },
  {
    id: 'xiaomi-15',
    name: 'Xiaomi 15',
    brand: 'Xiaomi',
    priceEuro: 849,
    capabilities: {
      soc: 94, pantalla: 88, camara: 88, storage: 75, ram: 85,
      bateria: 75, conectividad: 80, audio: 68, sensores: 70, software: 60,
    },
    highlights: ['Snapdragon top y Leica en compacto'],
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
    highlights: ['Reparable y con ética de materiales'],
  },
  {
    id: 'iphone-16e',
    name: 'iPhone 16e',
    brand: 'Apple',
    priceEuro: 699,
    capabilities: {
      soc: 90, pantalla: 72, camara: 75, storage: 55, ram: 65,
      bateria: 70, conectividad: 75, audio: 70, sensores: 75, software: 95,
    },
    highlights: ['Apple Intelligence a precio de entrada'],
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
    id: 'samsung-s25-ultra',
    name: 'Galaxy S25 Ultra',
    brand: 'Samsung',
    priceEuro: 1299,
    capabilities: {
      soc: 96, pantalla: 95, camara: 95, storage: 85, ram: 90,
      bateria: 80, conectividad: 90, audio: 78, sensores: 90, software: 90,
    },
    highlights: ['S Pen y zoom de referencia'],
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
    highlights: ['Bestia gaming con refrigeración activa'],
  },
  {
    id: 'honor-magic7-lite',
    name: 'Magic7 Lite',
    brand: 'HONOR',
    priceEuro: 449,
    capabilities: {
      soc: 65, pantalla: 74, camara: 68, storage: 60, ram: 65,
      bateria: 82, conectividad: 58, audio: 55, sensores: 55, software: 55,
    },
    highlights: ['Batería enorme en formato lite'],
  },
  {
    id: 'motorola-edge-50-pro',
    name: 'Edge 50 Pro',
    brand: 'Motorola',
    priceEuro: 599,
    capabilities: {
      soc: 75, pantalla: 82, camara: 72, storage: 65, ram: 70,
      bateria: 72, conectividad: 68, audio: 60, sensores: 58, software: 58,
    },
    highlights: ['Carga 125W y acabado premium'],
  },
]

/** Aviso corto para UI: los precios no son cotizaciones en vivo. */
export const CATALOG_PRICE_DISCLAIMER =
  'Precios orientativos de catálogo (UE). No son precios en vivo de tiendas.'
