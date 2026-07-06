// Categorias e seções de item de orçamento — compartilhadas entre o model
// Mongoose, as server actions (Zod) e a UI do wizard (Client Component). Sem
// dependências de servidor (mongoose/dbConnect) para poder ser importado no client.

export const PRODUCT_SECTIONS = ["poco_tubular", "conexao_tanque", "conjunto_motobomba"];

export const PRODUCT_CATEGORIES = [
  "perforacao_sedimentar",
  "perforacao_rocha",
  "revestimento",
  "filtros",
  "pre_filtro",
  "limpeza_desenvolvimento",
  "mobilizacao",
  "selo_sanitario",
  "equipamento_bombeamento",
  "outros",
];

// Define a seção (usada para os subtotais do orçamento/PDF) e quais campos
// técnicos fazem sentido para cada categoria.
export const PRODUCT_CATEGORY_META = {
  perforacao_sedimentar: { section: "poco_tubular", hasDepthRange: true, hasDiameter: true, hasEquipmentSpecs: false, defaultUnit: "m" },
  perforacao_rocha: { section: "poco_tubular", hasDepthRange: true, hasDiameter: true, hasEquipmentSpecs: false, defaultUnit: "m" },
  revestimento: { section: "poco_tubular", hasDepthRange: true, hasDiameter: true, hasEquipmentSpecs: false, defaultUnit: "m" },
  filtros: { section: "poco_tubular", hasDepthRange: true, hasDiameter: false, hasEquipmentSpecs: false, defaultUnit: "m" },
  pre_filtro: { section: "poco_tubular", hasDepthRange: false, hasDiameter: false, hasEquipmentSpecs: false, defaultUnit: "ton" },
  limpeza_desenvolvimento: { section: "poco_tubular", hasDepthRange: false, hasDiameter: false, hasEquipmentSpecs: false, defaultUnit: "gl" },
  mobilizacao: { section: "poco_tubular", hasDepthRange: false, hasDiameter: false, hasEquipmentSpecs: false, defaultUnit: "gl" },
  selo_sanitario: { section: "poco_tubular", hasDepthRange: false, hasDiameter: false, hasEquipmentSpecs: false, defaultUnit: "gl" },
  equipamento_bombeamento: { section: "conjunto_motobomba", hasDepthRange: false, hasDiameter: false, hasEquipmentSpecs: true, defaultUnit: "conj." },
  outros: { section: "conexao_tanque", hasDepthRange: false, hasDiameter: false, hasEquipmentSpecs: false, defaultUnit: "un." },
};

export function sectionForCategory(category) {
  return PRODUCT_CATEGORY_META[category]?.section ?? "conexao_tanque";
}
