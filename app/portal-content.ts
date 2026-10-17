import {knowledgeByFamily} from './product-knowledge.ts';
export type Product = {
  id:string; family:string; name:string; category:string; presentation:string;
  package:string|null; ingredients:string|null; usage:string|null;
  pending:string[]; image:string; source:string[];
  description:string; purpose?:string; benefits?:string[]; origin:string|null; line:string; features:string[];
  warnings:string[]; faqs:{question:string;answer:string;keywords?:string[];source?:string}[]; preparation:string|null;
};
// Transcription of supplied documents. Missing or conflicting fields remain null.
const catalogProducts:Product[] = [
  {
    "id": "active-pro-chocolate",
    "family": "Active Pro",
    "name": "Active Pro · Chocolate",
    "category": "Batido en polvo",
    "presentation": "Chocolate",
    "package": "770 g · 14 porciones",
    "ingredients": "Proteína de suero de leche, cacao, omega 3 y 6, aceite de canola, fibra de soya, estevia, vitaminas, minerales y cloruro de cromo.",
    "usage": null,
    "pending": [
      "Cantidad e indicaciones de uso: el catálogo y la ficha técnica difieren."
    ],
    "image": "/products/active-pro-chocolate.webp",
    "source": [
      "Ficha técnica, pp. 1–4",
      "Catálogo HC Wellness 2026, p. 4",
      "Contenido y porciones: etiqueta fotografiada en la ficha técnica."
    ],
    "description": "Complemento alimenticio en polvo que combina proteína de suero de leche, fibra, omegas, vitaminas y minerales. Disponible en Chocolate, Fresa y Tropical; cada sabor tiene su propia composición.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Proteína de suero de leche",
      "Omegas 3 y 6, fibra, vitaminas y minerales",
      "Endulzado con estevia, según la ficha técnica"
    ],
    "warnings": [
      "Contiene proteína de suero de leche. Incluye fibra de soya; consulta la etiqueta si tienes sensibilidad a estos ingredientes.",
      "La ficha indica supervisión de un pediatra para el consumo infantil."
    ],
    "faqs": [
      {
        "question": "¿Qué endulzante se menciona en la ficha?",
        "answer": "Hoja de estevia.",
        "keywords": [
          "endulzante",
          "edulcorante",
          "endulza"
        ]
      },
      {
        "question": "¿Todos los sabores tienen los mismos ingredientes?",
        "answer": "No. Chocolate menciona cacao y fibra de soya; Fresa, fresas; Tropical, piña y coco. Consulta la composición del sabor seleccionado."
      }
    ],
    "preparation": "Preparación en agua o leche. La cantidad de polvo y la proporción de líquido requieren confirmación porque el catálogo y la ficha técnica indican medidas diferentes."
  },
  {
    "id": "active-pro-fresa",
    "family": "Active Pro",
    "name": "Active Pro · Fresa",
    "category": "Batido en polvo",
    "presentation": "Fresa",
    "package": "770 g · 14 porciones",
    "ingredients": "Proteína de suero de leche, fresas, omega 3 y 6, fibra de avena, chía y guar, aceite de canola, vitaminas, minerales, estevia, folato y cloruro de cromo.",
    "usage": null,
    "pending": [
      "Cantidad e indicaciones de uso: el catálogo y la ficha técnica difieren."
    ],
    "image": "/products/active-pro-fresa.webp",
    "source": [
      "Ficha técnica, pp. 5–8",
      "Catálogo HC Wellness 2026, p. 4",
      "Contenido y porciones: etiqueta fotografiada en la ficha técnica."
    ],
    "description": "Complemento alimenticio en polvo que combina proteína de suero de leche, fibra, omegas, vitaminas y minerales. Disponible en Chocolate, Fresa y Tropical; cada sabor tiene su propia composición.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Proteína de suero de leche",
      "Omegas 3 y 6, fibra, vitaminas y minerales",
      "Endulzado con estevia, según la ficha técnica"
    ],
    "warnings": [
      "Contiene proteína de suero de leche. La ficha de este sabor indica que no es apto para personas con intolerancia a la lactosa.",
      "La ficha señala que la cantidad debe ajustarse a las necesidades de cada edad; no incluye una pauta infantil específica."
    ],
    "faqs": [
      {
        "question": "¿Qué endulzante se menciona en la ficha?",
        "answer": "Hoja de estevia.",
        "keywords": [
          "endulzante",
          "edulcorante",
          "endulza"
        ]
      },
      {
        "question": "¿Todos los sabores tienen los mismos ingredientes?",
        "answer": "No. Chocolate menciona cacao y fibra de soya; Fresa, fresas; Tropical, piña y coco. Consulta la composición del sabor seleccionado."
      }
    ],
    "preparation": "Preparación en agua o leche. La cantidad de polvo y la proporción de líquido requieren confirmación porque el catálogo y la ficha técnica indican medidas diferentes."
  },
  {
    "id": "active-pro-tropical",
    "family": "Active Pro",
    "name": "Active Pro · Tropical",
    "category": "Batido en polvo",
    "presentation": "Tropical",
    "package": "770 g · 14 porciones",
    "ingredients": "Proteína de suero de leche, piña y coco, omega 3 y 6, fibra de avena, chía y guar, aceite de canola, vitaminas, minerales, estevia, folato y cloruro de cromo.",
    "usage": null,
    "pending": [
      "Cantidad e indicaciones de uso: el catálogo y la ficha técnica difieren."
    ],
    "image": "/products/active-pro-tropical.webp",
    "source": [
      "Ficha técnica, pp. 41–44",
      "Catálogo HC Wellness 2026, p. 4",
      "Contenido y porciones: etiqueta fotografiada en la ficha técnica."
    ],
    "description": "Complemento alimenticio en polvo que combina proteína de suero de leche, fibra, omegas, vitaminas y minerales. Disponible en Chocolate, Fresa y Tropical; cada sabor tiene su propia composición.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Proteína de suero de leche",
      "Omegas 3 y 6, fibra, vitaminas y minerales",
      "Endulzado con estevia, según la ficha técnica"
    ],
    "warnings": [
      "Contiene proteína de suero de leche. La ficha de este sabor indica que no es apto para personas con intolerancia a la lactosa.",
      "La ficha señala que la cantidad debe ajustarse a las necesidades de cada edad; no incluye una pauta infantil específica."
    ],
    "faqs": [
      {
        "question": "¿Qué endulzante se menciona en la ficha?",
        "answer": "Hoja de estevia.",
        "keywords": [
          "endulzante",
          "edulcorante",
          "endulza"
        ]
      },
      {
        "question": "¿Todos los sabores tienen los mismos ingredientes?",
        "answer": "No. Chocolate menciona cacao y fibra de soya; Fresa, fresas; Tropical, piña y coco. Consulta la composición del sabor seleccionado."
      }
    ],
    "preparation": "Preparación en agua o leche. La cantidad de polvo y la proporción de líquido requieren confirmación porque el catálogo y la ficha técnica indican medidas diferentes."
  },
  {
    "id": "stormix",
    "family": "Stormix",
    "name": "Stormix · Sticks",
    "category": "Bebida en polvo",
    "presentation": "Sticks",
    "package": "28 sticks",
    "ingredients": "Guaraná, maca, noni, goji, açaí, mangostán, moringa, té verde, cúrcuma, jengibre, espino, schisandra, perejil, maracuyá, mango, alfalfa, frambuesa, uva morada y probióticos.",
    "usage": "Según la ficha técnica: disolver un sachet de 10 g en 250 ml de agua fría o al tiempo. Una vez al día por la mañana o antes de una actividad exigente.",
    "pending": [
      "Concentración de cafeína y cantidades de cada ingrediente."
    ],
    "image": "/products/stormix.webp",
    "source": [
      "Ficha técnica, pp. 38–40",
      "Catálogo HC Wellness 2026, p. 5"
    ],
    "description": "Bebida en polvo con guaraná, extractos botánicos, frutas y probióticos. Se presenta en sticks individuales para disolver en agua fría o al tiempo.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Sticks individuales",
      "Con guaraná y té verde",
      "Incluye seis cepas de probióticos, según la ficha técnica"
    ],
    "warnings": [
      "Formulado para adultos. La ficha no recomienda su uso durante el embarazo o la lactancia ni en personas alérgicas a sus ingredientes.",
      "Contiene guaraná y té verde. El catálogo indica no exceder la dosis recomendada."
    ],
    "faqs": [
      {
        "question": "¿Cómo se prepara?",
        "answer": "La ficha indica disolver un sachet de 10 g en 250 ml de agua fría o al tiempo."
      },
      {
        "question": "¿Es de origen vegetal?",
        "answer": "La ficha técnica lo describe como vegano y con ingredientes de origen vegetal.",
        "keywords": [
          "vegano",
          "vegana",
          "origen vegetal"
        ]
      },
      {
        "question": "¿Se puede tomar en ayunas?",
        "answer": "La sección de preguntas frecuentes de la ficha técnica indica que Stormix puede consumirse en ayunas.",
        "keywords": [
          "ayunas",
          "antes de desayunar",
          "antes del desayuno",
          "estómago vacío"
        ],
        "source": "Ficha técnica, p. 40"
      }
    ],
    "preparation": null
  },
  {
    "id": "complex-mocha-frasco",
    "family": "Complex Mocha",
    "name": "Complex Mocha · Frasco",
    "category": "Bebida en polvo",
    "presentation": "Frasco",
    "package": "280 g · 28 porciones",
    "ingredients": "Extractos de cereza y camu camu, mangostán, goji, fibra de manzana, diente de león, canela, clavo, inulina de agave, schisandra, gymnema, guanábana, fucoidano, açaí, alcachofa, semilla de apio, verbascósido, cacao, ácido cafeico, té verde y cardo mariano.",
    "usage": "Según el catálogo: agregar una medida en 200 ml de agua caliente y revolver hasta disolver. La ficha técnica también permite agua tibia y describe consumo una o dos veces al día, preferentemente en ayunas o como parte de la rutina matutina.",
    "pending": [
      "Equivalencia en gramos de la medida indicada."
    ],
    "image": "/products/complex-mocha-frasco.webp",
    "source": [
      "Ficha técnica, pp. 12–14",
      "Catálogo HC Wellness 2026, p. 6",
      "Contenido y porciones: etiqueta fotografiada en la ficha técnica."
    ],
    "description": "Complemento alimenticio en polvo a base de cacao que combina extractos de frutas, fibra, inulina de agave y otros ingredientes botánicos. Disponible en frasco y en sticks.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Fórmula a base de cacao",
      "Preparación con agua tibia o caliente",
      "Disponible en frasco y sticks"
    ],
    "warnings": [
      "La ficha no recomienda su consumo durante el embarazo o la lactancia.",
      "Consulta a un médico si eres sensible o alérgico a algún ingrediente.",
      "Mantener fuera del alcance de los niños. La ficha pide consultar con un pediatra antes de administrarlo."
    ],
    "faqs": [
      {
        "question": "¿Sustituye una comida?",
        "answer": "No. La ficha lo presenta como complemento de una alimentación equilibrada.",
        "keywords": [
          "sustituye una comida",
          "sustituir una comida",
          "reemplaza una comida",
          "sustituye el desayuno"
        ]
      },
      {
        "question": "¿Se puede preparar con agua tibia?",
        "answer": "Sí. La ficha técnica menciona agua tibia o caliente."
      },
      {
        "question": "¿Se puede tomar en ayunas?",
        "answer": "La ficha técnica menciona tomar Complex Mocha preferentemente en ayunas o como parte de la rutina matutina.",
        "keywords": [
          "ayunas",
          "antes de desayunar",
          "antes del desayuno",
          "estómago vacío"
        ],
        "source": "Ficha técnica, p. 13"
      }
    ],
    "preparation": null
  },
  {
    "id": "complex-mocha-stick",
    "family": "Complex Mocha",
    "name": "Complex Mocha · Stick",
    "category": "Bebida en polvo",
    "presentation": "Stick",
    "package": null,
    "ingredients": "Extractos de cereza y camu camu, mangostán, goji, fibra de manzana, diente de león, canela, clavo, inulina de agave, schisandra, gymnema, guanábana, fucoidano, açaí, alcachofa, semilla de apio, verbascósido, cacao, ácido cafeico, té verde y cardo mariano.",
    "usage": "Según el catálogo: agregar una medida en 200 ml de agua caliente y revolver hasta disolver. La ficha técnica también permite agua tibia y describe consumo una o dos veces al día, preferentemente en ayunas o como parte de la rutina matutina.",
    "pending": [
      "Equivalencia en gramos de la medida indicada.",
      "Cantidad de sticks y contenido neto de la bolsa."
    ],
    "image": "/products/complex-mocha-stick.webp",
    "source": [
      "Ficha técnica, pp. 32–34",
      "Catálogo HC Wellness 2026, p. 6"
    ],
    "description": "Complemento alimenticio en polvo a base de cacao que combina extractos de frutas, fibra, inulina de agave y otros ingredientes botánicos. Disponible en frasco y en sticks.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Fórmula a base de cacao",
      "Preparación con agua tibia o caliente",
      "Disponible en frasco y sticks"
    ],
    "warnings": [
      "La ficha no recomienda su consumo durante el embarazo o la lactancia.",
      "Consulta a un médico si eres sensible o alérgico a algún ingrediente.",
      "Mantener fuera del alcance de los niños. La ficha pide consultar con un pediatra antes de administrarlo."
    ],
    "faqs": [
      {
        "question": "¿Sustituye una comida?",
        "answer": "No. La ficha lo presenta como complemento de una alimentación equilibrada.",
        "keywords": [
          "sustituye una comida",
          "sustituir una comida",
          "reemplaza una comida",
          "sustituye el desayuno"
        ]
      },
      {
        "question": "¿Se puede preparar con agua tibia?",
        "answer": "Sí. La ficha técnica menciona agua tibia o caliente."
      },
      {
        "question": "¿Se puede tomar en ayunas?",
        "answer": "La ficha técnica menciona tomar Complex Mocha preferentemente en ayunas o como parte de la rutina matutina.",
        "keywords": [
          "ayunas",
          "antes de desayunar",
          "antes del desayuno",
          "estómago vacío"
        ],
        "source": "Ficha técnica, p. 33"
      }
    ],
    "preparation": null
  },
  {
    "id": "complex-green-leaves-frasco",
    "family": "Complex Green Leaves",
    "name": "Complex Green Leaves · Frasco",
    "category": "Bebida en polvo",
    "presentation": "Frasco",
    "package": "280 g · 28 porciones",
    "ingredients": "Matcha, spirulina, chlorella, camu camu, açaí, goji, mangostán, diente de león, alcachofa, guanábana, cactus, proteína de chícharo, inulina de agave, probióticos, canela, clavo, jengibre y semillas de apio.",
    "usage": "Según el catálogo: agregar una medida en 200 ml de agua caliente y revolver hasta disolver. La ficha técnica también permite agua tibia y describe consumo una o dos veces al día, preferentemente después de las comidas.",
    "pending": [
      "Equivalencia en gramos de la medida indicada."
    ],
    "image": "/products/complex-green-leaves-frasco.webp",
    "source": [
      "Ficha técnica, pp. 15–17",
      "Catálogo HC Wellness 2026, p. 7",
      "Contenido y porciones: etiqueta fotografiada en la ficha técnica."
    ],
    "description": "Complemento alimenticio en polvo a base de hojas verdes y matcha. Su fórmula reúne extractos vegetales, proteína de chícharo, inulina de agave y probióticos. Disponible en frasco y sticks.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Con matcha, spirulina y chlorella",
      "Con proteína de chícharo e inulina de agave",
      "Ingredientes de origen vegetal, según la ficha técnica"
    ],
    "warnings": [
      "La ficha no recomienda su consumo durante el embarazo o la lactancia.",
      "Consulta a un médico si eres sensible o alérgico a algún ingrediente.",
      "La ficha lo presenta como un producto para adultos."
    ],
    "faqs": [
      {
        "question": "¿Es vegano?",
        "answer": "La ficha lo describe como vegano, con ingredientes de origen vegetal.",
        "keywords": [
          "vegano",
          "vegana",
          "origen vegetal"
        ]
      },
      {
        "question": "¿Qué presentaciones hay?",
        "answer": "Frasco y sticks. Selecciona la presentación para ver su información."
      },
      {
        "question": "¿Se puede tomar en ayunas?",
        "answer": "La sección de preguntas frecuentes de la ficha técnica indica que Complex Green Leaves puede consumirse en ayunas.",
        "keywords": [
          "ayunas",
          "antes de desayunar",
          "antes del desayuno",
          "estómago vacío"
        ],
        "source": "Ficha técnica, p. 17"
      }
    ],
    "preparation": null
  },
  {
    "id": "complex-green-leaves-stick",
    "family": "Complex Green Leaves",
    "name": "Complex Green Leaves · Stick",
    "category": "Bebida en polvo",
    "presentation": "Stick",
    "package": null,
    "ingredients": "Matcha, spirulina, chlorella, camu camu, açaí, goji, mangostán, diente de león, alcachofa, guanábana, cactus, proteína de chícharo, inulina de agave, probióticos, canela, clavo, jengibre y semillas de apio.",
    "usage": "Según el catálogo: agregar una medida en 200 ml de agua caliente y revolver hasta disolver. La ficha técnica también permite agua tibia y describe consumo una o dos veces al día, preferentemente después de las comidas.",
    "pending": [
      "Equivalencia en gramos de la medida indicada.",
      "Cantidad de sticks y contenido neto de la bolsa."
    ],
    "image": "/products/complex-green-leaves-stick.webp",
    "source": [
      "Ficha técnica, pp. 35–37",
      "Catálogo HC Wellness 2026, p. 7"
    ],
    "description": "Complemento alimenticio en polvo a base de hojas verdes y matcha. Su fórmula reúne extractos vegetales, proteína de chícharo, inulina de agave y probióticos. Disponible en frasco y sticks.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Con matcha, spirulina y chlorella",
      "Con proteína de chícharo e inulina de agave",
      "Ingredientes de origen vegetal, según la ficha técnica"
    ],
    "warnings": [
      "La ficha no recomienda su consumo durante el embarazo o la lactancia.",
      "Consulta a un médico si eres sensible o alérgico a algún ingrediente.",
      "La ficha lo presenta como un producto para adultos."
    ],
    "faqs": [
      {
        "question": "¿Es vegano?",
        "answer": "La ficha lo describe como vegano, con ingredientes de origen vegetal.",
        "keywords": [
          "vegano",
          "vegana",
          "origen vegetal"
        ]
      },
      {
        "question": "¿Qué presentaciones hay?",
        "answer": "Frasco y sticks. Selecciona la presentación para ver su información."
      },
      {
        "question": "¿Se puede tomar en ayunas?",
        "answer": "La sección de preguntas frecuentes de la ficha técnica indica que Complex Green Leaves puede consumirse en ayunas.",
        "keywords": [
          "ayunas",
          "antes de desayunar",
          "antes del desayuno",
          "estómago vacío"
        ],
        "source": "Ficha técnica, p. 37"
      }
    ],
    "preparation": null
  },
  {
    "id": "re-new-pro",
    "family": "Re-New Pro",
    "name": "Re-New Pro · Gel tópico",
    "category": "Cuidado de la piel",
    "presentation": "Gel tópico",
    "package": "208.49 ml",
    "ingredients": "Aceite de argán, colágeno, ácido hialurónico y glutatión.",
    "usage": "Según la ficha técnica: limpiar y secar la piel, aplicar una pequeña cantidad y masajear suavemente hasta su absorción. Usar por la mañana y por la noche.",
    "pending": [],
    "image": "/products/re-new-pro.webp",
    "source": [
      "Ficha técnica, pp. 20–22",
      "Catálogo HC Wellness 2026, p. 8",
      "Contenido: etiqueta fotografiada en la ficha técnica, p. 20."
    ],
    "description": "Gel corporal de uso tópico para el cuidado diario de la piel. La ficha describe una textura fresca e hidratante con acabado mate y una fórmula con aceite de argán, colágeno, ácido hialurónico y glutatión.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Gel corporal de uso tópico",
      "Acabado mate y sensación fresca",
      "Sin fragancias, según la ficha técnica"
    ],
    "warnings": [
      "La ficha recomienda realizar una prueba de alergia en una pequeña zona antes del uso.",
      "Uso tópico: gel corporal."
    ],
    "faqs": [
      {
        "question": "¿Tiene fragancia?",
        "answer": "La ficha indica que está formulado sin fragancias.",
        "keywords": [
          "fragancia",
          "perfume",
          "aroma"
        ]
      },
      {
        "question": "¿Cuándo se aplica?",
        "answer": "La ficha indica aplicarlo por la mañana y por la noche sobre la piel limpia y seca."
      }
    ],
    "preparation": null
  },
  {
    "id": "hc-fit",
    "family": "HC-Fit",
    "name": "HC-Fit",
    "category": "Cápsulas",
    "presentation": "Cápsulas",
    "package": "30 cápsulas",
    "ingredients": "Hoja de tejocote y semillas de papaya.",
    "usage": null,
    "pending": [
      "Cantidad e indicaciones de uso: el catálogo y la ficha técnica difieren."
    ],
    "image": "/products/hc-fit.webp",
    "source": [
      "Ficha técnica, pp. 29–31",
      "Catálogo HC Wellness 2026, p. 9"
    ],
    "description": "Complemento alimenticio herbolario en cápsulas. Su fórmula combina hoja de tejocote y semillas de papaya; se presenta en un frasco de 30 cápsulas.",
    "origin": "México",
    "line": "Premium",
    "features": [
      "Fórmula herbolaria",
      "Con hoja de tejocote",
      "Con semillas de papaya"
    ],
    "warnings": [
      "La ficha recomienda consultar a un médico antes de usarlo si tienes condiciones médicas específicas.",
      "El catálogo indica no exceder la porción sugerida."
    ],
    "faqs": [
      {
        "question": "¿Qué ingredientes principales se mencionan?",
        "answer": "Hoja de tejocote y semillas de papaya."
      }
    ],
    "preparation": null
  },
  {
    "id": "ahcc-plus",
    "family": "AHCC+",
    "name": "AHCC+",
    "category": "Cápsulas",
    "presentation": "Cápsulas",
    "package": "60 cápsulas",
    "ingredients": "Extracto de hongo shiitake, té, guanábana, heliotropo, GABA y Morus alba.",
    "usage": "Según la ficha técnica: 2 cápsulas al día por vía oral con abundante agua.",
    "pending": [
      "Cantidades de los ingredientes y precauciones no detalladas en el material."
    ],
    "image": "/products/ahcc-plus.webp",
    "source": [
      "Ficha técnica, pp. 9–11",
      "Catálogo HC Wellness 2026, p. 11"
    ],
    "description": "Complemento nutricional en cápsulas formulado con extracto de hongo shiitake y otros ingredientes botánicos, entre ellos té, guanábana y Morus alba. La presentación del catálogo contiene 60 cápsulas.",
    "origin": "China",
    "line": "Select",
    "features": [
      "Con extracto de hongo shiitake",
      "Presentación en cápsulas",
      "Incluye GABA y otros ingredientes botánicos"
    ],
    "warnings": [
      "La ficha recomienda consultar a un médico antes de iniciar el uso si padeces alguna condición crónica."
    ],
    "faqs": [
      {
        "question": "¿Cuál es el ingrediente principal?",
        "answer": "La ficha identifica el extracto de hongo shiitake (Lentinula edodes)."
      }
    ],
    "preparation": null
  },
  {
    "id": "support-plus",
    "family": "Support+",
    "name": "Support+",
    "category": "Cápsulas",
    "presentation": "Cápsulas",
    "package": "90 cápsulas",
    "ingredients": "Calostros caprino y bovino, glutatión, resveratrol, yema de huevo, antioxidantes, lactoferrina, ácido glutámico, complejo vitamínico y ácido fólico.",
    "usage": "Según la ficha técnica: 3 cápsulas al día con abundante agua, preferentemente con las comidas principales.",
    "pending": [
      "Cantidades de cada ingrediente."
    ],
    "image": "/products/support-plus.webp",
    "source": [
      "Ficha técnica, pp. 23–25",
      "Catálogo HC Wellness 2026, p. 12"
    ],
    "description": "Complemento alimenticio en cápsulas con calostros caprino y bovino, lactoferrina, yema de huevo, antioxidantes y vitaminas. Se presenta en frasco de 90 cápsulas.",
    "origin": "México",
    "line": "Select",
    "features": [
      "Con calostro caprino y bovino",
      "Con lactoferrina y yema de huevo",
      "Incluye complejo vitamínico y ácido fólico"
    ],
    "warnings": [
      "Contiene ingredientes de leche y huevo: calostros, lactoferrina y yema de huevo.",
      "La ficha recomienda consultar a un médico antes de usarlo durante el embarazo, la lactancia o si existe alguna condición médica."
    ],
    "faqs": [
      {
        "question": "¿Cuántas cápsulas contiene el frasco?",
        "answer": "90 cápsulas, según el catálogo y la ficha técnica."
      }
    ],
    "preparation": null
  },
  {
    "id": "nad-shield-plus",
    "family": "NAD Shield+",
    "name": "NAD Shield+",
    "category": "Cápsulas",
    "presentation": "Cápsulas",
    "package": "60 cápsulas",
    "ingredients": "Mononucleótido de nicotinamida (NMN), pimienta negra, coenzima Q10, verbascósido y ácido alfa lipoico.",
    "usage": "Según la ficha técnica: 2 cápsulas al día por vía oral, con abundante agua, preferentemente durante las comidas principales.",
    "pending": [
      "Cantidades de los ingredientes y precauciones específicas: no se detallan en la ficha recibida."
    ],
    "image": "/products/nad-shield-plus.webp",
    "source": [
      "Ficha técnica, pp. 18–19",
      "Catálogo HC Wellness 2026, p. 13"
    ],
    "description": "Complemento alimenticio en cápsulas que incluye mononucleótido de nicotinamida (NMN), coenzima Q10 y ácido alfa lipoico. Forma parte de la línea Select del catálogo.",
    "origin": "China",
    "line": "Select",
    "features": [
      "Con NMN",
      "Con coenzima Q10 y ácido alfa lipoico",
      "Frasco de 60 cápsulas"
    ],
    "warnings": [],
    "faqs": [],
    "preparation": null
  },
  {
    "id": "connect-plus",
    "family": "Connect Plus",
    "name": "Connect Plus",
    "category": "Cápsulas",
    "presentation": "Cápsulas",
    "package": "60 cápsulas",
    "ingredients": "Ginseng, ginkgo biloba, bacopa monnieri, huperzina, curcumina, astaxantina, ashwagandha, triptófano, luteína y bisglicinato de magnesio.",
    "usage": "Según la ficha técnica: 2 cápsulas al día, preferentemente por la mañana después de los alimentos.",
    "pending": [
      "Cantidades de cada ingrediente."
    ],
    "image": "/products/connect-plus.webp",
    "source": [
      "Ficha técnica, pp. 26–28",
      "Catálogo HC Wellness 2026, p. 14"
    ],
    "description": "Complemento alimenticio en cápsulas con una combinación de extractos vegetales y otros componentes, entre ellos ginseng, ginkgo biloba, bacopa, ashwagandha y bisglicinato de magnesio.",
    "origin": "China",
    "line": "Select",
    "features": [
      "Con ginseng, ginkgo biloba y bacopa",
      "Incluye luteína y bisglicinato de magnesio",
      "Frasco de 60 cápsulas"
    ],
    "warnings": [
      "La ficha lo presenta como un producto para adultos.",
      "Consulta a un médico si estás embarazada, lactando o bajo tratamiento médico, según la ficha."
    ],
    "faqs": [
      {
        "question": "¿A quién se dirige?",
        "answer": "La ficha lo presenta para adultos."
      }
    ],
    "preparation": null
  },
  {
    "id": "hemp-c",
    "family": "Hemp-C",
    "name": "Hemp-C · Gotero",
    "category": "Aceite",
    "presentation": "Gotero",
    "package": "30 ml",
    "ingredients": null,
    "usage": null,
    "pending": [
      "Composición completa, concentración, cantidad de uso y precauciones específicas."
    ],
    "image": "/products/hemp-c.webp",
    "source": [
      "Catálogo HC Wellness 2026, p. 15"
    ],
    "description": "Producto líquido de la línea Select presentado en frasco con gotero de 30 ml. El catálogo describe su administración sublingual, pero no incluye la concentración ni una lista completa de ingredientes.",
    "origin": null,
    "line": "Select",
    "features": [
      "Presentación líquida",
      "Frasco con gotero",
      "Contenido de 30 ml"
    ],
    "warnings": [
      "El catálogo indica no exceder la dosis diaria recomendada. No proporciona concentración ni precauciones específicas."
    ],
    "faqs": [],
    "preparation": "El catálogo describe uso sublingual: mantener el líquido debajo de la lengua durante 60 segundos antes de tragar. La cantidad requiere confirmar la concentración y la etiqueta vigente."
  },
  {
    "id": "espresso",
    "family": "Espresso",
    "name": "Espresso · Daily",
    "category": "Café",
    "presentation": "Daily",
    "package": "84 g · 28 porciones",
    "ingredients": "La etiqueta fotografiada menciona café negro árabe y diez hongos adaptógenos. El material no detalla las especies ni la lista completa de ingredientes.",
    "usage": "Según el catálogo: mezclar una porción en agua caliente. Consumir preferentemente por la mañana o antes de actividades de alto rendimiento.",
    "pending": [
      "Especies de hongos y composición completa, cantidad exacta por porción, volumen de agua y precauciones."
    ],
    "image": "/products/espresso.webp",
    "source": [
      "Catálogo HC Wellness 2026, p. 17",
      "Contenido, porciones y base de la fórmula: etiqueta fotografiada en el catálogo."
    ],
    "description": "Café Espresso en polvo de la línea Daily. La etiqueta fotografiada lo describe como un suplemento alimenticio a base de café negro árabe con diez hongos adaptógenos; se prepara con agua caliente.",
    "origin": null,
    "line": "Daily",
    "features": [
      "Café negro árabe, según la etiqueta",
      "Con diez hongos adaptógenos, según la etiqueta",
      "Bolsa de 84 g con 28 porciones"
    ],
    "warnings": [],
    "faqs": [
      {
        "question": "¿Cómo se prepara?",
        "answer": "El catálogo indica mezclar una porción con agua caliente; no especifica el volumen de agua."
      }
    ],
    "preparation": null
  },
  {
    "id": "macchiato",
    "family": "Macchiato",
    "name": "Macchiato · Daily",
    "category": "Café",
    "presentation": "Daily",
    "package": "280 g · 28 porciones",
    "ingredients": "La etiqueta fotografiada menciona café negro árabe y diez hongos adaptógenos. El material no detalla las especies ni la lista completa de ingredientes.",
    "usage": "Según el catálogo: mezclar una porción en agua caliente. Consumir preferentemente por la mañana o antes de actividades de alto rendimiento.",
    "pending": [
      "Especies de hongos y composición completa, cantidad exacta por porción, volumen de agua y precauciones."
    ],
    "image": "/products/macchiato.webp",
    "source": [
      "Catálogo HC Wellness 2026, p. 18",
      "Contenido, porciones y base de la fórmula: etiqueta fotografiada en el catálogo."
    ],
    "description": "Café Macchiato en polvo de la línea Daily, presentado en bolsa para preparar con agua caliente. La etiqueta fotografiada lo describe como un suplemento alimenticio con café negro árabe y diez hongos adaptógenos.",
    "origin": null,
    "line": "Daily",
    "features": [
      "Presentación Macchiato de la línea Daily",
      "Con diez hongos adaptógenos, según la etiqueta",
      "Bolsa de 280 g con 28 porciones"
    ],
    "warnings": [],
    "faqs": [
      {
        "question": "¿Cómo se prepara?",
        "answer": "El catálogo indica mezclar una porción con agua caliente; no especifica el volumen de agua."
      }
    ],
    "preparation": null
  }
];

export const products:Product[]=catalogProducts.map(product=>({...product,...knowledgeByFamily[product.family]}));
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function answerQuestion(question:string):string {
  const value=normalize(question);
  const matches=products.filter(p=>value.includes(normalize(p.family)));
  if(!matches.length)return 'No encuentro esa respuesta en la información de esta guía. Consulta con la persona que te compartió el enlace.';
  const namedVariants=matches.filter(p=>value.includes(normalize(p.presentation)));
  const product=namedVariants.length===1?namedVariants[0]:matches[0];
  const fasting=/ayunas|antesdedesayunar|antesdeldesayuno|estomagovacio/.test(value);
  const faq=product.faqs.find(faq=>faq.keywords?.some(keyword=>value.includes(normalize(keyword))));
  if(product.family==='Active Pro'&&/diabet/.test(value)&&!/embaraz|lactan|amamant|doypecho|dandopecho/.test(value)){
    const diabetes=`No puedo confirmar que ${namedVariants.length===1?product.name:product.family} sea adecuado para una persona con diabetes solo con la información disponible. Para valorarlo, hay que revisar los carbohidratos totales por porción y la cantidad que se consumiría con su profesional de salud. No es un tratamiento para la diabetes.`;
    if(!/alerg|intoleran|lactosa|soya|leche/.test(value))return diabetes;
    if(namedVariants.length!==1)return diabetes+' Para revisar la alergia o intolerancia, selecciona el sabor: Chocolate, Fresa o Tropical.';
    return diabetes+' '+product.warnings.filter(w=>/alerg|intoleran|lactosa|soya|leche/i.test(w)).join(' ');
  }
  if(/precaucion|advertencia|contraindic|embaraz|lactan|amamant|doypecho|dandopecho|alerg|enfermedad|diabet|hipertens|gastrit|padez|diagnost|tengo|medicamento|antibiotic|tratamiento|segur/.test(value)||(/puedo|debo/.test(value)&&!faq&&!fasting)){
    if(namedVariants.length!==1&&matches.some(p=>p.warnings.join('\n')!==product.warnings.join('\n')))return `Las precauciones dependen de la presentación de ${product.family}. Selecciona una: ${matches.map(p=>p.presentation).join(', ')}. Consulta también a tu profesional de salud.`;
    return `${product.name}. Precauciones indicadas: ${product.warnings.length?product.warnings.join(' '):'Las precauciones específicas están por confirmar.'} Esta guía no determina si es adecuado para ti; consulta la etiqueta vigente y a tu profesional de salud.`;
  }
  if(faq)return `${faq.answer} Fuente: ${faq.source??product.source.join('; ')}.`;
  if(/benefici/.test(value)&&product.benefits?.length)return `${product.family} tiene este enfoque nutricional:\n\n${product.benefits.map(benefit=>'• '+benefit).join('\n')}`;
  if(/paraquesirv|benefici|cuales.*funcion|cuales.*utilidad/.test(value))return product.purpose??`${product.name}. ${product.description}`;
  if(fasting)return `El material recibido no especifica si ${product.family} puede tomarse en ayunas. Consulta la etiqueta vigente y a tu profesional de salud.`;
  if(/hora|horario/.test(value))return 'Esta biblioteca no establece un horario personalizado. Consulta las indicaciones del producto y la orientación de tu profesional de salud.';
  if(/presentacion|variante|sabor/.test(value))return `${matches[0].family}: ${matches.map(p=>p.presentation).join(', ')}.`;
  if(/ingrediente|composicion/.test(value)){
    if(namedVariants.length!==1&&matches.some(p=>p.ingredients!==product.ingredients))return `Selecciona la presentación de ${product.family}: ${matches.map(p=>p.presentation).join(', ')}. Su composición puede variar.`;
    return product.ingredients?`${product.name}. Ingredientes según el material recibido: ${product.ingredients} Fuente: ${product.source.join('; ')}.`:`La composición de ${product.name} está por confirmar.`;
  }
  if(/pendiente|confirmar/.test(value))return product.pending.length?`${product.family}: por confirmar. ${product.pending.join(' ')}`:`No hay campos marcados como pendientes en la ficha de ${product.family}.`;
  if(/quees|descripcion|cuentame/.test(value))return `${product.name}. ${product.description} Contenido: ${product.package??'por confirmar'}.`;
  if(!/prepar|como.*(tom|us|consum|aplic)|dosis|cantidad|indicacion/.test(value))return `No encuentro esa respuesta en la información disponible de ${product.family}. Puedes consultar sus ingredientes, preparación y precauciones, o preguntar a la persona que te compartió la guía.`;
  if(!product.usage)return `Las indicaciones de ${product.family} están por confirmar. ${product.preparation??''} ${product.pending.join(' ')} Consulta la etiqueta vigente y a tu profesional de salud.`;
  return `${product.name}. ${product.usage} Fuente: ${product.source.join('; ')}. Consulta la etiqueta vigente y a tu profesional de salud.`;
}
