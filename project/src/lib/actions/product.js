"use server";

import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
import { sectionForCategory } from "@/lib/constants/quote-items";
import { productSchema } from "@/lib/schemas/product";
import { Products } from "@/lib/models/Product";
import { Workspaces } from "@/lib/models/Workspace";

// total é sempre quantity * unitPrice — nunca aceito diretamente do cliente.
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
      ...toProductDoc(parsed.data),
    });
    return { success: true, message: "Item criado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível criar o item. Tente novamente.", };
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
      { $set: toProductDoc(parsed.data) },
    );
    if (result.matchedCount === 0) return { success: false, message: "Item não encontrado.", };
    return { success: true, message: "Item atualizado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível atualizar o item. Tente novamente.", };
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
    if (result.deletedCount === 0) return { success: false, message: "Item não encontrado.", };
    return { success: true, message: "Item removido com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível remover o item. Tente novamente.", };
  }
}
