"use server";

import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
import { Quotes } from "@/lib/models/Quote";
import { Workspaces } from "@/lib/models/Workspace";

const quoteSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do orçamento"),
  description: z.string().trim().optional(),
  products: z
    .array(
      z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Produto inválido" }),
    )
    .optional()
    .default([]),
  workId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Selecione uma obra válida" }),
  clientId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Selecione um cliente válido" }),
});

export async function createQuote(workspaceId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsed = quoteSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos", };

  try {
    await Quotes.create({
      workspaceId: workspace._id,
      ...parsed.data,
    });
    return { success: true, message: "Orçamento criado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível criar o orçamento. Tente novamente.", };
  }
}

export async function updateQuote(workspaceId, quoteId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsed = quoteSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos", };

  try {
    const result = await Quotes.updateOne(
      { _id: new mongoose.Types.ObjectId(quoteId), workspaceId: workspace._id },
      { $set: parsed.data },
    );
    if (result.matchedCount === 0) return { success: false, message: "Orçamento não encontrado.", };
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
