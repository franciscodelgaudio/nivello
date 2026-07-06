import z from "zod";

import { PRODUCT_CATEGORIES } from "@/lib/constants/quote-items";

export const equipmentSpecsSchema = z.object({
  model: z.string().trim().optional(),
  power: z.string().trim().optional(),
  voltage: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  cableSpec: z.string().trim().optional(),
  pipeSpec: z.string().trim().optional(),
});

// Reaproveitado por createQuote (src/lib/actions/quote.js) para validar cada
// item embutido no wizard de criação de orçamento.
export const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do item"),
  description: z.string().trim().optional(),
  category: z.enum(PRODUCT_CATEGORIES, { error: "Selecione a categoria" }),
  depthFrom: z.coerce.number().optional(),
  depthTo: z.coerce.number().optional(),
  diameter: z.string().trim().optional(),
  quantity: z.coerce.number({ error: "Informe a quantidade" }).positive("Quantidade deve ser maior que zero"),
  unit: z.string().trim().min(1, "Informe a unidade"),
  unitPrice: z.coerce.number({ error: "Informe o preço unitário" }),
  equipmentSpecs: equipmentSpecsSchema.optional(),
});
