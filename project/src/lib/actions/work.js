"use server";

import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { Works } from "@/lib/models/Work";
import { Workspaces } from "@/lib/models/Workspace";

const workSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da obra"),
  description: z.string().trim().optional(),
  startDate: z.coerce.date({ error: "Informe a data de início" }),
  deadline: z.coerce.date({ error: "Informe o prazo" }),
  address: z.string().trim().min(1, "Informe o endereço"),
  clientId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Selecione um cliente válido" }),
});

export async function createWork(workspaceId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsed = workSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos", };

  try {
    await Works.create({
      workspaceId: workspace._id,
      ...parsed.data,
    });
    return { success: true, message: "Obra criada com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível criar a obra. Tente novamente.", };
  }
}

export async function updateWork(workspaceId, workId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsed = workSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos", };

  try {
    const result = await Works.updateOne(
      { _id: new mongoose.Types.ObjectId(workId), workspaceId: workspace._id },
      { $set: parsed.data },
    );
    if (result.matchedCount === 0) return { success: false, message: "Obra não encontrada.", };
    return { success: true, message: "Obra atualizada com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível atualizar a obra. Tente novamente.", };
  }
}

export async function deleteWork(workspaceId, workId) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  try {
    const result = await Works.deleteOne({
      _id: new mongoose.Types.ObjectId(workId),
      workspaceId: workspace._id,
    });
    if (result.deletedCount === 0) return { success: false, message: "Obra não encontrada.", };
    return { success: true, message: "Obra removida com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível remover a obra. Tente novamente.", };
  }
}
