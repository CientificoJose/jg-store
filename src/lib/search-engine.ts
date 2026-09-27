import { StoreProduct } from '@/types/store';

// Normaliza texto: minúsculas, sin acentos/diacríticos y sin puntuación
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos (á -> a, é -> e, etc.)
    .replace(/[^a-z0-9\s]/g, ' ')   // Reemplaza puntuación por espacios
    .replace(/\s+/g, ' ')           // Colapsa espacios múltiples
    .trim();
}

// Cálculo rápido de distancia Levenshtein para errores de tipeo (typos)
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Límite de optimización rápida
  if (Math.abs(a.length - b.length) > 3) return 4;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1      // borrado
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Diccionario de familias y conceptos relacionados adaptado al polirrubro de JG Store
interface SynonymFamily {
  concept: string;
  keywords: string[]; // Lo que el usuario podría escribir
  targetTerms: string[]; // Términos que deben coincidir en productos
  categorySlugs?: string[]; // Categorías oficiales asociadas
}

const SYNONYM_FAMILIES: SynonymFamily[] = [
  {
    concept: 'Tecnología, Celulares y Gadgets',
    keywords: [
      'telefono', 'telefonos', 'celular', 'celulares', 'celu', 'smartphone', 'smartphones',
      'movil', 'moviles', 'iphone', 'samsung', 'xiaomi', 'motorola', 'cargador', 'cables'
    ],
    targetTerms: ['smartphone', 'smartphones', 'celular', 'carga', 'inalambrica', 'usb', 'tecnologia', 'gadget', 'cargador', 'notebook'],
    categorySlugs: ['electro']
  },
  {
    concept: 'Computación, Notebooks y Oficina',
    keywords: ['computadora', 'computadoras', 'notebook', 'notebooks', 'laptop', 'laptops', 'pc', 'ordenador'],
    targetTerms: ['notebook', 'usb', 'mochila', 'antirrobo', 'escritorio', 'led'],
    categorySlugs: ['electro', 'mochilas-maletines']
  },
  {
    concept: 'Audio, Música y Sonido',
    keywords: ['musica', 'audio', 'auricular', 'auriculares', 'parlante', 'parlantes', 'sonido', 'bluetooth', 'inalambrico'],
    targetTerms: ['auricular', 'auriculares', 'bluetooth', 'f9', 'tws', 'audio', 'sonido'],
    categorySlugs: ['electro']
  },
  {
    concept: 'Bazar, Termos y Cafetería',
    keywords: ['mate', 'mates', 'termo', 'termos', 'cafe', 'cafetera', 'te', 'infusion', 'desayuno', 'botella', 'botellas'],
    targetTerms: ['termo', 'termos', 'botella', 'bazar', 'cuenco', 'cocina', 'vajilla'],
    categorySlugs: ['bazar-cocina']
  },
  {
    concept: 'Cocina, Vajilla y Hogar',
    keywords: ['cocina', 'vajilla', 'vaso', 'vasos', 'plato', 'platos', 'taza', 'tazas', 'recipiente', 'recipientes', 'tupper'],
    targetTerms: ['bazar', 'cocina', 'vajilla', 'recipiente', 'cuenco'],
    categorySlugs: ['bazar-cocina', 'deco-organizacion-hogar']
  },
  {
    concept: 'Librería, Cuadernos y Escuela',
    keywords: [
      'escuela', 'colegio', 'estudio', 'estudiar', 'facultad', 'lapicera', 'lapiceras', 'birome',
      'biromes', 'lapiz', 'lapices', 'hoja', 'hojas', 'carpeta', 'carpetas', 'cartuchera', 'cartucheras'
    ],
    targetTerms: ['libreria', 'cuaderno', 'cuadernos', 'marcador', 'marcadores', 'papeleria', 'lettering', 'a4'],
    categorySlugs: ['libreria', 'cartucheras-carpetas']
  },
  {
    concept: 'Juguetería, Juegos y Niños',
    keywords: ['juguete', 'juguetes', 'nene', 'nena', 'bebe', 'chico', 'chicos', 'infantil', 'didactico', 'didacticos', 'regalo', 'regalos'],
    targetTerms: ['jugueteria', 'juguetes', 'didacticos', 'bloques', 'magneticos', 'peluches', 'ninos'],
    categorySlugs: ['jugueteria', 'pelucheria']
  },
  {
    concept: 'Peluches y Regalos',
    keywords: ['peluche', 'peluches', 'oso', 'afelpado', 'muneco', 'munecos'],
    targetTerms: ['pelucheria', 'peluches', 'oso', 'afelpada', 'hipoalergenico'],
    categorySlugs: ['pelucheria']
  },
  {
    concept: 'Limpieza e Higiene',
    keywords: ['limpieza', 'higiene', 'trapo', 'trapos', 'repasador', 'pano', 'panos', 'microfibra', 'desinfeccion'],
    targetTerms: ['higiene', 'limpieza', 'microfibra', 'panos', 'absorbente'],
    categorySlugs: ['higiene-limpieza']
  },
  {
    concept: 'Ferretería, Iluminación y Camping',
    keywords: ['herramienta', 'herramientas', 'ferreteria', 'camping', 'pesca', 'linterna', 'linternas', 'luz'],
    targetTerms: ['ferreteria', 'linterna', 'tactica', 'pesca', 'lumens'],
    categorySlugs: ['ferreteria-pesca']
  },
  {
    concept: 'Mochilas, Billeteras y Marroquinería',
    keywords: ['mochila', 'mochilas', 'bolso', 'bolsos', 'billetera', 'billeteras', 'cartera', 'carteras', 'valija', 'valijas', 'viaje'],
    targetTerms: ['mochila', 'mochilas', 'marroquineria', 'billetera', 'billeteras', 'rfid', 'antirrobo'],
    categorySlugs: ['mochilas-maletines', 'marroquineria', 'articulos-viaje']
  },
  {
    concept: 'Aromatización y Velas',
    keywords: ['vela', 'velas', 'aroma', 'aromas', 'olor', 'perfume', 'sahumerio', 'difusor', 'difusores', 'esencia', 'esencias'],
    targetTerms: ['aromatizacion', 'velas', 'vela', 'difusor', 'difusores', 'lavanda', 'soja'],
    categorySlugs: ['aromatizacion-velas']
  },
  {
    concept: 'Arte y Manualidades',
    keywords: ['pintura', 'pinturas', 'pincel', 'pinceles', 'acrilico', 'acrilicos', 'arte', 'dibujo', 'manualidades'],
    targetTerms: ['arte', 'pinturas', 'acrilicos', 'manualidades', 'pigmentacion'],
    categorySlugs: ['arte-manualidades']
  },
  {
    concept: 'Mascotas',
    keywords: ['perro', 'perros', 'gato', 'gatos', 'mascota', 'mascotas', 'canino', 'felino'],
    targetTerms: ['mascotas', 'perros', 'gatos', 'comedero'],
    categorySlugs: ['mascotas']
  },
  {
    concept: 'Navidad y Fiestas',
    keywords: ['navidad', 'arbolito', 'luces', 'guirnalda', 'guirnaldas', 'navideno'],
    targetTerms: ['navidad', 'guirnalda', 'luces', 'fiestas'],
    categorySlugs: ['navidad', 'cotillon']
  },
  {
    concept: 'Verano e Inflables',
    keywords: ['pileta', 'playa', 'verano', 'inflable', 'inflables', 'flotador', 'flotadores'],
    targetTerms: ['verano', 'inflables', 'flotador', 'playa'],
    categorySlugs: ['verano']
  }
];

export interface SearchMatchMetadata {
  matchType: 'exact' | 'related' | 'typo' | 'empty';
  matchedConcept?: string;
  correctedWord?: string;
  originalQuery: string;
}

export interface SmartSearchResult {
  products: StoreProduct[];
  metadata: SearchMatchMetadata;
}

/**
 * Motor de búsqueda inteligente para JG Store:
 * 1. Coincidencia exacta / parcial en nombre, SKU, tags y descripción.
 * 2. Tolerancia a errores de tipeo (Fuzzy search Levenshtein <= 2).
 * 3. Matriz de sinónimos polirrubro (ej. "telefono" -> "Lámpara con carga Qi para smartphones").
 * 4. Categorías afines si no hay coincidencia exacta de título.
 */
export function performSmartSearch(
  allProducts: StoreProduct[],
  searchQuery: string
): SmartSearchResult {
  const raw = searchQuery.trim();
  if (!raw) {
    return {
      products: allProducts,
      metadata: { matchType: 'exact', originalQuery: '' }
    };
  }

  const normalizedQuery = normalizeText(raw);
  const queryTokens = normalizedQuery.split(' ').filter((t) => t.length > 0);

  // 1. Paso A: Búsqueda Exacta o Substring Inteligente
  const exactMatches = allProducts.filter((p) => {
    const pName = normalizeText(p.name);
    const pSku = normalizeText(p.sku);
    const pDesc = normalizeText(p.description);
    const pTags = (p.tags || []).map(normalizeText);
    const pAllWords = [
      ...pName.split(' '),
      ...pDesc.split(' '),
      ...pTags.flatMap((t) => t.split(' ')),
      pSku
    ].filter(Boolean);

    // Si la búsqueda es de más de una palabra y coincide la frase exacta completa
    if (normalizedQuery.includes(' ') && (pName.includes(normalizedQuery) || pDesc.includes(normalizedQuery))) {
      return true;
    }

    // Coincidencia de tokens: para palabras cortas (<= 4 letras) exigir que coincida la palabra completa o inicio de palabra
    const allTokensMatch = queryTokens.every((token) => {
      // Si el SKU lo incluye
      if (pSku.includes(token)) return true;

      // Buscar si alguna palabra del producto coincide exactamente o empieza con el token
      return pAllWords.some((word) => {
        if (word === token) return true;
        // Manejo de plural/singular: ej "cuadernos" -> "cuaderno"
        if (token.endsWith('s') && word === token.slice(0, -1)) return true;
        if (word.endsWith('s') && token === word.slice(0, -1)) return true;
        if (token.endsWith('es') && word === token.slice(0, -2)) return true;
        if (word.endsWith('es') && token === word.slice(0, -2)) return true;

        // Si el token es largo (>= 5 letras), permitimos prefijo o substring
        if (token.length >= 5 && (word.startsWith(token) || word.includes(token))) {
          return true;
        }

        return false;
      });
    });

    return allTokensMatch;
  });

  if (exactMatches.length > 0) {
    return {
      products: exactMatches,
      metadata: {
        matchType: 'exact',
        originalQuery: raw
      }
    };
  }

  // 2. Paso B: Detección por Corrección de Tipeo (Fuzzy Search / Typos)
  let bestCorrectedWord: string | undefined;
  const typoMatches = allProducts.filter((p) => {
    const wordsInProduct = [
      ...normalizeText(p.name).split(' '),
      ...(p.tags || []).map(normalizeText)
    ];

    for (const qToken of queryTokens) {
      if (qToken.length < 4) continue; // no aplicar a palabras muy cortas
      for (const prodWord of wordsInProduct) {
        if (prodWord.length < 4) continue;
        const maxDist = prodWord.length > 6 ? 2 : 1;
        const dist = levenshteinDistance(qToken, prodWord);
        if (dist > 0 && dist <= maxDist) {
          bestCorrectedWord = prodWord;
          return true;
        }
      }
    }
    return false;
  });

  if (typoMatches.length > 0) {
    return {
      products: typoMatches,
      metadata: {
        matchType: 'typo',
        correctedWord: bestCorrectedWord,
        originalQuery: raw
      }
    };
  }

  // 3. Paso C: Matriz de Sinónimos y Conceptos Relacionados
  // Buscamos si alguno de los tokens del usuario coincide con una familia de sinónimos
  let matchedFamily: SynonymFamily | undefined;

  for (const family of SYNONYM_FAMILIES) {
    const match = family.keywords.some((kw) => {
      const normKw = normalizeText(kw);
      return (
        normKw === normalizedQuery ||
        queryTokens.includes(normKw) ||
        (normKw.length >= 4 && queryTokens.some((t) => t.length >= 4 && levenshteinDistance(t, normKw) <= 1))
      );
    });

    if (match) {
      matchedFamily = family;
      break;
    }
  }

  if (matchedFamily) {
    // Puntuamos productos según los términos clave de la familia
    const relatedProducts = allProducts
      .map((product) => {
        let score = 0;
        const pName = normalizeText(product.name);
        const pDesc = normalizeText(product.description);
        const pTags = (product.tags || []).map(normalizeText).join(' ');
        const pCat = normalizeText(product.category_slug);

        // Coincidencia en categorías asociadas
        if (matchedFamily?.categorySlugs?.includes(product.category_slug)) {
          score += 35;
        }

        // Coincidencia en términos de destino
        for (const term of matchedFamily?.targetTerms || []) {
          const normTerm = normalizeText(term);
          if (pName.includes(normTerm)) score += 40;
          if (pTags.includes(normTerm)) score += 30;
          if (pDesc.includes(normTerm)) score += 15;
          if (pCat.includes(normTerm)) score += 20;
        }

        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    if (relatedProducts.length > 0) {
      return {
        products: relatedProducts,
        metadata: {
          matchType: 'related',
          matchedConcept: matchedFamily.concept,
          originalQuery: raw
        }
      };
    }
  }

  // 4. Paso D: Si no hay coincidencia, retornar vacío para que ProductGrid muestre los sugeridos generales
  return {
    products: [],
    metadata: {
      matchType: 'empty',
      originalQuery: raw
    }
  };
}
