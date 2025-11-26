// Base de datos de recomendaciones para enfermedades por especie
export const diseaseRecommendations = {
  "Cucumis sativus": {
    scientificName: "Cucumis sativus",
    commonName: "Pepino",
    diseases: [
      {
        name: "Mildiu (Downy Mildew)",
        symptoms: [
          "Manchas amarillas en las hojas",
          "Necrosis en las hojas",
          "Aparición especialmente con humedad"
        ],
        treatments: [
          "Mejorar la ventilación",
          "Reducir la humedad en el follaje",
          "Usar fungicidas apropiados cuando sea necesario (según recomendaciones locales)"
        ]
      },
      {
        name: "Tizón gomoso (Gummosis)",
        cause: "Hongo Didymella bryoniae",
        symptoms: [
          "Emisión de goma (savia pegajosa) en el tallo",
          "Debilitamiento de la planta",
          "Colapso de la planta"
        ],
        treatments: [
          "Eliminar restos de cultivo infectados",
          "Rotación de cultivo",
          "Usar semillas sanas",
          "Controlar con fungicidas si es viable",
          "Manejo de residuos es clave ya que el hongo puede sobrevivir en restos de cultivo"
        ]
      },
      {
        name: "Virus",
        symptoms: [
          "Síntomas variables según el virus específico",
          "Depende de la región y vectores específicos"
        ],
        treatments: [
          "Usar variedades resistentes si están disponibles",
          "Controlar vectores (insectos transmisores)",
          "Eliminar plantas infectadas"
        ]
      }
    ],
    generalPractices: [
      "Mantener campo limpio",
      "Usar variedades más resistentes si están disponibles"
    ]
  },
  "Dioscorea alata": {
    scientificName: "Dioscorea alata",
    commonName: "Ñame",
    diseases: [
      {
        name: "Antracnosis",
        cause: "Colletotrichum alatae / gloeosporioides",
        symptoms: [
          "Necrosis en las hojas",
          "Manchas negras o marrones",
          "Muerte de brotes"
        ],
        treatments: [
          "Usar variedades resistentes (una de las mejores estrategias)",
          "Uso de fungicidas: mezclas como la de Burdeos y otros fungicidas (en producción de semilla)",
          "Remover y quemar residuos infectados para reducir el inóculo",
          "Rotación de cultivos"
        ]
      },
      {
        name: "Virus",
        symptoms: [
          "Mosaico en las hojas",
          "Deformaciones",
          "Menor rendimiento",
          "Banda en venas",
          "Debilitamiento"
        ],
        treatments: [
          "Usar material de siembra sano",
          "Eliminar plantas severamente infectadas",
          "Controlar vectores de virus"
        ]
      },
      {
        name: "Mancha marrón de hoja",
        cause: "Mycosphaerella henningsii",
        symptoms: [
          "Manchas marrones en las hojas"
        ],
        treatments: [
          "Manejo de residuos",
          "Fungicidas apropiados"
        ]
      },
      {
        name: "Nematodos",
        cause: "Scutellonema bradys",
        symptoms: [
          "Dry rot en tubérculos",
          "Daño interno en tubérculos"
        ],
        treatments: [
          "Evitar heridas en tubérculos al cosechar",
          "Usar prácticas de almacenamiento sanas",
          "Tratamientos nematicidas si están permitidos en tu región"
        ]
      },
      {
        name: "Podredumbres de tubérculo",
        cause: "Fusarium, Penicillium, Rosellinia",
        symptoms: [
          "Pudrición en tubérculos",
          "Grietas",
          "Zonas necrosadas",
          "Rojez interna o seca según el patógeno"
        ],
        treatments: [
          "Selección y saneamiento de material de siembra",
          "Usar 'seed-yam' libre de enfermedad",
          "Evitar propagar tubérculos infectados",
          "Prácticas de almacenamiento adecuadas"
        ]
      }
    ],
    generalPractices: [
      "Rotación de cultivos: evitar plantar ñame en el mismo lugar sin rotar",
      "Selección de cultivares resistentes",
      "Manejo adecuado de residuos"
    ]
  },
  "Manihot esculenta": {
    scientificName: "Manihot esculenta",
    commonName: "Yuca / Cassava",
    diseases: [
      {
        name: "Brote bacteriano de yuca (Bacterial Blight)",
        cause: "Xanthomonas axonopodis pv. manihotis",
        symptoms: [
          "Marchitez",
          "Necrosis vascular",
          "Muerte regresiva (dieback)",
          "Manchas en las hojas",
          "Necrosis"
        ],
        treatments: [
          "Usar material de siembra certificado sano (esquejes sanos)",
          "Poda o eliminación de tejido infectado",
          "Rotación de cultivos",
          "Saneamiento: remover restos infectados"
        ]
      },
      {
        name: "Mosaico de yuca",
        cause: "African cassava mosaic virus (ACMV) y/o Indian cassava mosaic virus (ICMV)",
        vector: "Mosca blanca Bemisia tabaci",
        symptoms: [
          "Hojas con patrón de mosaico",
          "Clorosis",
          "Deformaciones",
          "Crecimiento reducido"
        ],
        treatments: [
          "Uso de variedades resistentes / tolerantes",
          "Controlar el vector (mosca blanca Bemisia tabaci)",
          "Eliminación de plantas muy infectadas para reducir fuente de inóculo",
          "Buen manejo agronómico: plantaciones limpias",
          "Evitar altas densidades que favorezcan vectores"
        ]
      },
      {
        name: "Mancha marrón de hoja",
        cause: "Mycosphaerella henningsii",
        symptoms: [
          "Puntos marrones en hojas",
          "Bordes oscuros",
          "Caída prematura de hojas"
        ],
        treatments: [
          "Manejo de residuos de hojas infectadas (eliminar hojas caídas)",
          "Rotación de cultivo para reducir la presión de inóculo",
          "Posible uso de fungicidas (según regulaciones locales) si la infección es grave"
        ]
      }
    ],
    generalPractices: [
      "Usar material de siembra certificado",
      "Mantener plantaciones limpias",
      "Rotación de cultivos"
    ]
  },
  "Solanum melongena": {
    scientificName: "Solanum melongena",
    commonName: "Berenjena",
    diseases: [
      {
        name: "Bacterial Wilt",
        cause: "Ralstonia solanacearum",
        symptoms: [
          "Marchitez",
          "Hojas amarillentas",
          "Caída de hojas",
          "Vascularización oscura al cortar el tallo"
        ],
        treatments: [
          "Seleccionar híbridos o variedades con resistencia al marchitamiento bacteriano",
          "Rotación de cultivos: no plantar berenjena u otras solanáceas en el mismo suelo por varios años",
          "Saneamiento del campo: eliminar plantas infectadas",
          "Limpiar restos y desinfectar herramientas"
        ]
      },
      {
        name: "Fusarium Wilt",
        cause: "Fusarium oxysporum f. sp. melongenae",
        symptoms: [
          "Marchitez",
          "Hojas amarillentas",
          "Vascularización oscura al cortar el tallo"
        ],
        treatments: [
          "Variedades resistentes",
          "Rotación de cultivos",
          "Mejorar el drenaje (el suelo no debe estar demasiado compactado)",
          "Saneamiento del campo"
        ]
      },
      {
        name: "Verticillium Wilt",
        cause: "Verticillium dahliae",
        symptoms: [
          "Marchitez",
          "Hojas amarillentas",
          "Vascularización oscura al cortar el tallo"
        ],
        treatments: [
          "Variedades resistentes",
          "Rotación de cultivos",
          "Mejorar el drenaje",
          "Saneamiento del campo"
        ]
      },
      {
        name: "Cercospora Leaf Spot",
        cause: "Cercospora melongenae",
        symptoms: [
          "Lesiones circulares/irregulares en hojas"
        ],
        treatments: [
          "Uso de fungicidas específicos (respetar regulaciones locales)",
          "Saneamiento del campo",
          "Rotación de cultivos"
        ]
      },
      {
        name: "Phomopsis Blight",
        cause: "Phomopsis vexans",
        symptoms: [
          "Lesiones en hojas y frutos",
          "Pycnidios negros en los tejidos infectados"
        ],
        treatments: [
          "Uso de fungicidas",
          "Saneamiento del campo",
          "Rotación de cultivos"
        ]
      }
    ],
    generalPractices: [
      "Rotación de cultivos (evitar solanáceas en el mismo suelo)",
      "Saneamiento del campo",
      "Mejorar el drenaje",
      "Control biológico (dependiendo de la región y disponibilidad local)"
    ]
  },
  "Zea mays": {
    scientificName: "Zea mays",
    commonName: "Maíz",
    diseases: [
      {
        name: "Gray Leaf Spot (Mancha gris foliar)",
        cause: "Cercospora zeae-maydis",
        symptoms: [
          "Lesiones rectangulares, necróticas",
          "Paralelas a las venas",
          "Pardeamiento"
        ],
        treatments: [
          "Usar híbridos resistentes",
          "Rotación de cultivos",
          "Manejo de residuos: eliminar restos de plantas infectadas",
          "Fungicidas foliares cuando sea apropiado"
        ]
      },
      {
        name: "Southern Corn Leaf Blight",
        cause: "Bipolaris maydis (Cochliobolus heterostrophus)",
        symptoms: [
          "Manchas foliares",
          "Necrosis",
          "Dependiendo de la raza"
        ],
        treatments: [
          "Variedades resistentes",
          "Rotación de cultivos",
          "Manejo de residuos",
          "Fungicidas foliares"
        ]
      },
      {
        name: "Common Rust",
        cause: "Puccinia sorghi",
        symptoms: [
          "Pústulas rojizas u óxido en las hojas",
          "En condiciones favorables"
        ],
        treatments: [
          "Usar híbridos resistentes a roya",
          "Fungicidas foliares",
          "Monitoreo regular"
        ]
      },
      {
        name: "Corn Smut",
        cause: "Ustilago maydis",
        symptoms: [
          "Tumores (galls) en mazorcas, tallos, hojas",
          "Contienen esporas oscuras"
        ],
        treatments: [
          "Variedades resistentes",
          "Rotación de cultivos",
          "Eliminar y destruir galls antes de que liberen esporas"
        ]
      },
      {
        name: "Stalk Rots (Podredumbre de tallo)",
        cause: "Fusarium spp., Gibberella, etc.",
        symptoms: [
          "Debilitamiento del tallo",
          "Pudrición interna",
          "Caída de plantas"
        ],
        treatments: [
          "Variedades resistentes",
          "Optimizar densidad de siembra",
          "Ventilación entre plantas",
          "Fertilización adecuada (evitar exceso de nitrógeno)",
          "Manejo de residuos"
        ]
      },
      {
        name: "Tar Spot",
        cause: "Phyllachora maydis",
        symptoms: [
          "Puntos negros circulares (estroma) en hojas"
        ],
        treatments: [
          "Variedades resistentes",
          "Fungicidas foliares",
          "Manejo de residuos"
        ]
      }
    ],
    generalPractices: [
      "Rotación de cultivos",
      "Manejo de residuos: eliminar restos de plantas infectadas",
      "Optimizar densidad de siembra y ventilación",
      "Fertilización adecuada (evitar exceso de nitrógeno puede reducir algunas enfermedades)",
      "Inspección y monitoreo: vigilancia regular para detectar primeros síntomas",
      "Manejo biológico: en algunos casos pueden usarse biocontroladores"
    ]
  }
};

// Función para obtener recomendaciones por nombre científico
export function getRecommendationsByScientificName(scientificName) {
  if (!scientificName) return null;
  
  // Normalizar el nombre científico
  let normalizedName = scientificName.trim();
  
  // Corregir errores comunes de ortografía PRIMERO (antes de normalizar)
  // "Discorea" -> "Dioscorea" (falta la 'i')
  // Maneja cualquier combinación de mayúsculas/minúsculas
  normalizedName = normalizedName.replace(/^[Dd]iscorea\s+/i, 'Dioscorea ');
  
  // Eliminar abreviaturas comunes de autores botánicos (L., L.f., Mill., etc.)
  // Esto maneja casos como "Dioscorea alata L." -> "Dioscorea alata"
  normalizedName = normalizedName.replace(/\s+[A-Z]\.?\s*([A-Z]\.)?\s*$/i, '').trim();
  
  // Eliminar cualquier porcentaje o confianza al final (ej: "Dioscorea alata (95%)")
  normalizedName = normalizedName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  
  // Normalizar a minúsculas para comparación
  const normalizedLower = normalizedName.toLowerCase();
  
  // Buscar coincidencia exacta (case-insensitive)
  const exactMatch = Object.keys(diseaseRecommendations).find(
    key => key.toLowerCase() === normalizedLower
  );
  if (exactMatch) {
    return diseaseRecommendations[exactMatch];
  }
  
  // Extraer solo el género y especie (primeras dos palabras)
  const nameParts = normalizedLower.split(/\s+/).filter(part => part.length > 0);
  if (nameParts.length >= 2) {
    const genusSpecies = nameParts.slice(0, 2).join(' ');
    
    // Buscar coincidencia por género y especie
    const genusSpeciesMatch = Object.keys(diseaseRecommendations).find(key => {
      const keyParts = key.toLowerCase().split(/\s+/).filter(part => part.length > 0);
      if (keyParts.length >= 2) {
        const keyGenusSpecies = keyParts.slice(0, 2).join(' ');
        return keyGenusSpecies === genusSpecies;
      }
      return false;
    });
    
    if (genusSpeciesMatch) {
      return diseaseRecommendations[genusSpeciesMatch];
    }
  }
  
  // Buscar coincidencia parcial más flexible
  for (const key in diseaseRecommendations) {
    const keyLower = key.toLowerCase();
    
    // Extraer género y especie del key
    const keyParts = keyLower.split(/\s+/).filter(part => part.length > 0);
    if (keyParts.length >= 2) {
      const keyGenus = keyParts[0];
      const keySpecies = keyParts[1];
      
      // Extraer género y especie del nombre normalizado
      if (nameParts.length >= 2) {
        const inputGenus = nameParts[0];
        const inputSpecies = nameParts[1];
        
        // Comparar género y especie por separado (más flexible)
        const genusMatch = keyGenus === inputGenus || 
                          keyGenus.includes(inputGenus) || 
                          inputGenus.includes(keyGenus);
        const speciesMatch = keySpecies === inputSpecies || 
                            keySpecies.includes(inputSpecies) || 
                            inputSpecies.includes(keySpecies);
        
        if (genusMatch && speciesMatch && keyGenus.length >= 5 && inputGenus.length >= 5) {
          console.log(`✅ Coincidencia parcial encontrada: "${key}" para "${scientificName}"`);
          return diseaseRecommendations[key];
        }
      }
    }
  }
  
  console.warn(`⚠️ No se encontraron recomendaciones para: "${scientificName}" (normalizado: "${normalizedName}")`);
  return null;
}

