"use server";

import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
import { sectionForCategory } from "@/lib/constants/quote-items";
import { productSchema } from "@/lib/schemas/product";
import { Quotes } from "@/lib/models/Quote";
import { Products } from "@/lib/models/Product";
import { Workspaces } from "@/lib/models/Workspace";

const quoteHeaderSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do orçamento"),
  description: z.string().trim().optional(),
  workId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Selecione uma obra válida" }),
  clientId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Selecione um cliente válido" }),
  paymentTerms: z.string().trim().optional(),
  deliveryTerm: z.string().trim().optional(),
  validityDays: z.coerce.number({ error: "Informe a validade em dias" }).int().positive(),
  taxIncluded: z.boolean().optional().default(true),
});

function toProductDoc(item) {
  const { quantity, unitPrice, category, ...rest } = item;
  return {
    ...rest,
    category,
    section: sectionForCategory(category),
    quantity,
    unitPrice,
    total: quantity * unitPrice,
  };
}

// createQuote recebe os itens do orçamento embutidos (values.items) e cria os
// Products correspondentes antes do Quote — é o que o wizard de criação usa.
export async function createQuote(workspaceId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsedHeader = quoteHeaderSchema.safeParse(values);
  if (!parsedHeader.success) return { success: false, message: parsedHeader.error.issues[0]?.message ?? "Dados inválidos", };

  const itemsInput = Array.isArray(values.items) ? values.items : [];
  if (itemsInput.length === 0) return { success: false, message: "Adicione ao menos um item ao orçamento.", };

  const parsedItems = [];
  for (const item of itemsInput) {
    const parsedItem = productSchema.safeParse(item);
    if (!parsedItem.success) return { success: false, message: parsedItem.error.issues[0]?.message ?? "Item inválido", };
    parsedItems.push(parsedItem.data);
  }

  try {
    const createdProducts = await Products.insertMany(
      parsedItems.map((item) => ({ workspaceId: workspace._id, ...toProductDoc(item) })),
    );

    const lastQuote = await Quotes.findOne({ workspaceId: workspace._id })
      .sort({ quoteNumber: -1 })
      .select("quoteNumber")
      .lean();
    const quoteNumber = (lastQuote?.quoteNumber || 0) + 1;

    await Quotes.create({
      workspaceId: workspace._id,
      quoteNumber,
      ...parsedHeader.data,
      products: createdProducts.map((product) => product._id),
    });

    return { success: true, message: "Orçamento criado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível criar o orçamento. Tente novamente.", };
  }
}

// updateQuote recebe os itens do orçamento embutidos (values.items), assim como
// createQuote — os Products antigos são substituídos pelos novos (nunca
// compartilhados entre orçamentos, então é seguro recriá-los a cada edição).
export async function updateQuote(workspaceId, quoteId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsedHeader = quoteHeaderSchema.safeParse(values);
  if (!parsedHeader.success) return { success: false, message: parsedHeader.error.issues[0]?.message ?? "Dados inválidos", };

  const itemsInput = Array.isArray(values.items) ? values.items : [];
  if (itemsInput.length === 0) return { success: false, message: "Adicione ao menos um item ao orçamento.", };

  const parsedItems = [];
  for (const item of itemsInput) {
    const parsedItem = productSchema.safeParse(item);
    if (!parsedItem.success) return { success: false, message: parsedItem.error.issues[0]?.message ?? "Item inválido", };
    parsedItems.push(parsedItem.data);
  }

  try {
    const quote = await Quotes.findOne({
      _id: new mongoose.Types.ObjectId(quoteId),
      workspaceId: workspace._id,
    }).lean();
    if (!quote) return { success: false, message: "Orçamento não encontrado.", };

    const createdProducts = await Products.insertMany(
      parsedItems.map((item) => ({ workspaceId: workspace._id, ...toProductDoc(item) })),
    );

    await Quotes.updateOne(
      { _id: quote._id },
      { $set: { ...parsedHeader.data, products: createdProducts.map((product) => product._id) } },
    );

    if (quote.products?.length) {
      await Products.deleteMany({ _id: { $in: quote.products } });
    }

    return { success: true, message: "Orçamento atualizado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível atualizar o orçamento. Tente novamente.", };
  }
}

export async function deleteQuote(workspaceId, quoteId) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  try {
    const result = await Quotes.deleteOne({
      _id: new mongoose.Types.ObjectId(quoteId),
      workspaceId: workspace._id,
    });
    if (result.deletedCount === 0) return { success: false, message: "Orçamento não encontrado.", };
    return { success: true, message: "Orçamento removido com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível remover o orçamento. Tente novamente.", };
  }
}
