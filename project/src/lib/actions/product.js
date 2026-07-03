"use server";

import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
import { Products } from "@/lib/models/Product";
import { Workspaces } from "@/lib/models/Workspace";

const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto"),
  description: z.string().trim().optional(),
  quantity: z.coerce.number({ error: "Informe a quantidade" }),
  unit: z.string().trim().min(1, "Informe a unidade"),
  total: z.coerce.number({ error: "Informe o total" }),
  type: z.enum(["service", "material"], { error: "Selecione o tipo" }),
});

export async function createProduct(workspaceId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos", };

  try {
    await Products.create({
      workspaceId: workspace._id,
      ...parsed.data,
    });
    return { success: true, message: "Produto criado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível criar o produto. Tente novamente.", };
  }
}

export async function updateProduct(workspaceId, productId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos", };

  try {
    const result = await Products.updateOne(
      { _id: new mongoose.Types.ObjectId(productId), workspaceId: workspace._id },
      { $set: parsed.data },
    );
    if (result.matchedCount === 0) return { success: false, message: "Produto não encontrado.", };
    return { success: true, message: "Produto atualizado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível atualizar o produto. Tente novamente.", };
  }
}

export async function deleteProduct(workspaceId, productId) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  try {
    const result = await Products.deleteOne({
      _id: new mongoose.Types.ObjectId(productId),
      workspaceId: workspace._id,
    });
    if (result.deletedCount === 0) return { success: false, message: "Produto não encontrado.", };
    return { success: true, message: "Produto removido com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível remover o produto. Tente novamente.", };
  }
}
