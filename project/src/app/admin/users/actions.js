"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/handler/session";
import { Users } from "@/lib/models/User";

const ROLE_VALUES = ["admin", "user"];

export async function setUserRole(formData) {
  const currentUser = await requireRole("admin");

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (typeof userId !== "string" || !mongoose.Types.ObjectId.isValid(userId)) {
    return;
  }

  if (typeof role !== "string" || !ROLE_VALUES.includes(role)) {
    return;
  }

  // Impede que um admin altere a própria função para evitar se autoexcluir do acesso.
  if (userId === currentUser.id) {
    return;
  }

  await Users.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $set: { role } });

  revalidatePath("/admin/users");
}
