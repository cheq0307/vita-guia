export type Product = {
  id:string; family:string; name:string; category:string; presentation:string;
  package:string|null; ingredients:string|null; usage:string|null;
  pending:string[]; image:string; source:string[];
};
// Transcription of supplied documents. Missing or conflicting fields remain null.
export const products:Product[] = [
  {
    "id": "active-pro-chocolate",
    "family": "Active Pro",
    "name": "Active Pro · Chocolate",
    "category": "Batido en polvo",
    "presentation": "Chocolate",
    "package": null,
    "ingredients": "Proteína de suero de leche, cacao, omega 3 y 6, aceite de canola, fibra de soya, estevia, vitaminas, minerales y cloruro de cromo.",
    "usage": null,
    "pending": [
      "Cantidad e indicaciones de uso: los documentos difieren.",
      "Contenido neto y precauciones de cada sabor."
    ],
    "image": "/products/active-pro-chocolate.webp",
    "source": [
      "Ficha técnica, pp. 1–4",
      "Catálogo HC Wellness 2026, p. 4"
    ]
  },
  {
    "id": "active-pro-fresa",
    "family": "Active Pro",
    "name": "Active Pro · Fresa",
    "category": "Batido en polvo",
    "presentation": "Fresa",
    "package": null,
    "ingredients": "Proteína de suero de leche, fresas, omega 3 y 6, fibra de avena, chía y guar, aceite de canola, vitaminas, minerales, estevia, folato y cloruro de cromo.",
    "usage": null,
    "pending": [
      "Cantidad e indicaciones de uso: los documentos difieren.",
      "Contenido neto y precauciones de cada sabor."
    ],
    "image": "/products/active-pro-fresa.webp",
    "source": [
      "Ficha técnica, pp. 5–8",
      "Catálogo HC Wellness 2026, p. 4"
    ]
  },
  {
    "id": "active-pro-tropical",
    "family": "Active Pro",
    "name": "Active Pro · Tropical",
    "category": "Batido en polvo",
    "presentation": "Tropical",
    "package": null,
    "ingredients": "Proteína de suero de leche, piña y coco, omega 3 y 6, fibra de avena, chía y guar, aceite de canola, vitaminas, minerales, estevia, folato y cloruro de cromo.",
    "usage": null,
    "pending": [
      "Cantidad e indicaciones de uso: los documentos difieren.",
      "Contenido neto y precauciones de cada sabor."
    ],
    "image": "/products/active-pro-tropical.webp",
    "source": [
      "Ficha técnica, pp. 41–44",
      "Catálogo HC Wellness 2026, p. 4"
    ]
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
      "Precauciones y concentración de cafeína."
    ],
    "image": "/products/stormix.webp",
    "source": [
      "Ficha técnica, pp. 38–40",
      "Catálogo HC Wellness 2026, p. 5"
    ]
  },
  {
    "id": "complex-mocha-frasco",
    "family": "Complex Mocha",
    "name": "Complex Mocha · Frasco",
    "category": "Bebida en polvo",
    "presentation": "Frasco",
    "package": null,
    "ingredients": "Extractos de cereza y camu camu, mangostán, goji, fibra de manzana, diente de león, canela, clavo, inulina de agave, schisandra, gymnema, guanábana, fucoidano, açaí, alcachofa, semilla de apio, verbascósido, cacao, ácido cafeico, té verde y cardo mariano.",
    "usage": null,
    "pending": [
      "Medida exacta, preparación y contenido de esta presentación.",
      "Precauciones."
    ],
    "image": "/products/complex-mocha-frasco.webp",
    "source": [
      "Ficha técnica, pp. 12–14",
      "Catálogo HC Wellness 2026, p. 6"
    ]
  },
  {
    "id": "complex-mocha-stick",
    "family": "Complex Mocha",
    "name": "Complex Mocha · Stick",
    "category": "Bebida en polvo",
    "presentation": "Stick",
    "package": null,
    "ingredients": "Extractos de cereza y camu camu, mangostán, goji, fibra de manzana, diente de león, canela, clavo, inulina de agave, schisandra, gymnema, guanábana, fucoidano, açaí, alcachofa, semilla de apio, verbascósido, cacao, ácido cafeico, té verde y cardo mariano.",
    "usage": null,
    "pending": [
      "Medida exacta, preparación y contenido de esta presentación.",
      "Precauciones."
    ],
    "image": "/products/complex-mocha-stick.webp",
    "source": [
      "Ficha técnica, pp. 32–34",
      "Catálogo HC Wellness 2026, p. 6"
    ]
  },
  {
    "id": "complex-green-leaves-frasco",
    "family": "Complex Green Leaves",
    "name": "Complex Green Leaves · Frasco",
    "category": "Bebida en polvo",
    "presentation": "Frasco",
    "package": null,
    "ingredients": "Matcha, spirulina, chlorella, camu camu, açaí, goji, mangostán, diente de león, alcachofa, guanábana, cactus, proteína de chícharo, inulina de agave, probióticos, canela, clavo, jengibre y semillas de apio.",
    "usage": null,
    "pending": [
      "Medida exacta, preparación y contenido de esta presentación.",
      "Precauciones."
    ],
    "image": "/products/complex-green-leaves-frasco.webp",
    "source": [
      "Ficha técnica, pp. 15–17",
      "Catálogo HC Wellness 2026, p. 7"
    ]
  },
  {
    "id": "complex-green-leaves-stick",
    "family": "Complex Green Leaves",
    "name": "Complex Green Leaves · Stick",
    "category": "Bebida en polvo",
    "presentation": "Stick",
    "package": null,
    "ingredients": "Matcha, spirulina, chlorella, camu camu, açaí, goji, mangostán, diente de león, alcachofa, guanábana, cactus, proteína de chícharo, inulina de agave, probióticos, canela, clavo, jengibre y semillas de apio.",
    "usage": null,
    "pending": [
      "Medida exacta, preparación y contenido de esta presentación.",
      "Precauciones."
    ],
    "image": "/products/complex-green-leaves-stick.webp",
    "source": [
      "Ficha técnica, pp. 35–37",
      "Catálogo HC Wellness 2026, p. 7"
    ]
  },
  {
    "id": "re-new-pro",
    "family": "Re-New Pro",
    "name": "Re-New Pro · Gel tópico",
    "category": "Cuidado de la piel",
    "presentation": "Gel tópico",
    "package": null,
    "ingredients": "Aceite de argán, colágeno, ácido hialurónico y glutatión.",
    "usage": "Según la ficha técnica: limpiar y secar la piel, aplicar una pequeña cantidad y masajear suavemente hasta su absorción. Usar por la mañana y por la noche.",
    "pending": [
      "Contenido neto y precauciones de uso tópico."
    ],
    "image": "/products/re-new-pro.webp",
    "source": [
      "Ficha técnica, pp. 20–22",
      "Catálogo HC Wellness 2026, p. 8"
    ]
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
      "Cantidad e indicaciones de uso: los documentos difieren.",
      "Precauciones."
    ],
    "image": "/products/hc-fit.webp",
    "source": [
      "Ficha técnica, pp. 29–31",
      "Catálogo HC Wellness 2026, p. 9"
    ]
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
      "Concentraciones y precauciones."
    ],
    "image": "/products/ahcc-plus.webp",
    "source": [
      "Ficha técnica, pp. 9–11",
      "Catálogo HC Wellness 2026, p. 11"
    ]
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
      "Concentraciones y precauciones. Contiene ingredientes de leche y huevo."
    ],
    "image": "/products/support-plus.webp",
    "source": [
      "Ficha técnica, pp. 23–25",
      "Catálogo HC Wellness 2026, p. 12"
    ]
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
      "Concentraciones y precauciones."
    ],
    "image": "/products/nad-shield-plus.webp",
    "source": [
      "Ficha técnica, pp. 18–19",
      "Catálogo HC Wellness 2026, p. 13"
    ]
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
      "Concentraciones y precauciones."
    ],
    "image": "/products/connect-plus.webp",
    "source": [
      "Ficha técnica, pp. 26–28",
      "Catálogo HC Wellness 2026, p. 14"
    ]
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
      "Composición, concentración, indicaciones de uso y precauciones."
    ],
    "image": "/products/hemp-c.webp",
    "source": [
      "Catálogo HC Wellness 2026, p. 15"
    ]
  },
  {
    "id": "espresso",
    "family": "Espresso",
    "name": "Espresso · Daily",
    "category": "Café",
    "presentation": "Daily",
    "package": null,
    "ingredients": null,
    "usage": null,
    "pending": [
      "Composición completa, porción, preparación, contenido neto y precauciones."
    ],
    "image": "/products/espresso.webp",
    "source": [
      "Catálogo HC Wellness 2026, p. 17"
    ]
  },
  {
    "id": "macchiato",
    "family": "Macchiato",
    "name": "Macchiato · Daily",
    "category": "Café",
    "presentation": "Daily",
    "package": null,
    "ingredients": null,
    "usage": null,
    "pending": [
      "Composición completa, porción, preparación, contenido neto y precauciones."
    ],
    "image": "/products/macchiato.webp",
    "source": [
      "Catálogo HC Wellness 2026, p. 18"
    ]
  }
];

const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function answerQuestion(question:string):string {
  const value=normalize(question);
  const matches=products.filter(p=>value.includes(normalize(p.family)));
  if(!matches.length)return 'No encuentro esa respuesta en la información de esta guía. Consulta con la persona que te compartió el enlace.';
  if(/precaucion|advertencia|contraindic|embaraz|lactancia|alerg|enfermedad|diabet|medicamento|segur|puedo|debo/.test(value))return `Las precauciones completas de ${matches[0].family} están por confirmar. Esta guía no permite determinar si es adecuado para ti. Consulta la etiqueta vigente y a tu profesional de salud.`;
  if(/hora|horario/.test(value))return 'Esta biblioteca no establece un horario personalizado. Consulta las indicaciones del producto y la orientación de tu profesional de salud.';
  if(/presentacion|variante|sabor/.test(value))return `${matches[0].family}: ${matches.map(p=>p.presentation).join(', ')}.`;
  const product=matches.find(p=>value.includes(normalize(p.name)))??matches[0];
  if(/ingrediente|composicion/.test(value))return product.ingredients?`${product.name}. Ingredientes mencionados en la ficha técnica: ${product.ingredients}`:`La composición de ${product.name} está por confirmar.`;
  if(/pendiente|confirmar/.test(value))return `${product.family}: por confirmar. ${product.pending.join(' ')}`;
  if(!/prepar|como.*(tom|us|consum|aplic)|dosis|cantidad|indicacion/.test(value))return `${product.name}: ${product.category}. Contenido: ${product.package??'por confirmar'}. Puedes consultar sus ingredientes, presentaciones o indicaciones disponibles.`;
  if(!product.usage)return `Las indicaciones de ${product.family} están por confirmar. ${product.pending.join(' ')} Consulta la etiqueta vigente y a tu profesional de salud.`;
  return `${product.name}. ${product.usage} Fuente: ${product.source.join('; ')}. Consulta la etiqueta vigente y a tu profesional de salud.`;
}
export const videos = [
  {title:'Cómo organizar tu rutina diaria',description:'Una guía simple para integrar tus productos sin complicaciones.',duration:'04:18',tone:'mint'},
  {title:'Preguntas frecuentes',description:'Respuestas antes de comenzar.',duration:'03:10',tone:'mint'},
];
export const stories = [
  {name:'Mariana',period:'8 semanas',quote:'Tener toda la información en un solo lugar me ayudó a ser constante.'},
];
