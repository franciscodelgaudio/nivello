"use server";

import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { Clients } from "@/lib/models/Client";
import { Workspaces } from "@/lib/models/Workspace";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cliente"),
  address: z.string().trim().min(1, "Informe o endereço"),
  cellphone: z.string().trim().min(1, "Informe o celular"),
});

export async function createClient(workspaceId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos", };

  try {
    await Clients.create({
      workspaceId: workspace._id,
      ...parsed.data,
    });
    return { success: true, message: "Cliente criado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível criar o cliente. Tente novamente.", };
  }
}

export async function updateClient(workspaceId, clientId, values) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos", };

  try {
    const result = await Clients.updateOne(
      { _id: new mongoose.Types.ObjectId(clientId), workspaceId: workspace._id },
      { $set: parsed.data },
    );
    if (result.matchedCount === 0) return { success: false, message: "Cliente não encontrado.", };
    return { success: true, message: "Cliente atualizado com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível atualizar o cliente. Tente novamente.", };
  }
}

export async function deleteClient(workspaceId, clientId) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();
  if (!workspace) notFound();

  try {
    const result = await Clients.deleteOne({
      _id: new mongoose.Types.ObjectId(clientId),
      workspaceId: workspace._id,
    });
    if (result.deletedCount === 0) return { success: false, message: "Cliente não encontrado.", };
    return { success: true, message: "Cliente removido com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível remover o cliente. Tente novamente.", };
  }
}
