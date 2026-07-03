import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import Display from "@/components/dashboard/workspaceId/clients/new/Display";
import { Clients } from "@/lib/models/Client";
import { Workspaces } from "@/lib/models/Workspace";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cliente"),
  address: z.string().trim().min(1, "Informe o endereço"),
  cellphone: z.string().trim().min(1, "Informe o celular"),
});

export default async function NewClientPage({ params, searchParams }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    notFound();
  }

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: new mongoose.Types.ObjectId(session.user.id),
  }).lean();

  if (!workspace) {
    notFound();
  }

  async function createClient(formData) {
    "use server";

    const actionSession = await auth();
    if (!actionSession?.user) {
      redirect("/login");
    }

    const actionWorkspace = await Workspaces.findOne({
      _id: new mongoose.Types.ObjectId(workspaceId),
      owner: new mongoose.Types.ObjectId(actionSession.user.id),
    }).lean();

    if (!actionWorkspace) {
      notFound();
    }

    const parsed = clientSchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      cellphone: formData.get("cellphone"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
      redirect(`/workspaces/${workspaceId}/clients/new?error=${encodeURIComponent(message)}`);
    }

    await Clients.create({
      workspaceId: actionWorkspace._id,
      ...parsed.data,
    });

    revalidatePath(`/workspaces/${workspaceId}/clients`);
    redirect(`/workspaces/${workspaceId}/clients`);
  }

  const { error } = await searchParams;

  return (
    <Display
      workspaceId={workspace._id.toString()}
      workspaceName={workspace.name}
      userName={session.user.name ?? session.user.email}
      createClient={createClient}
      error={typeof error === "string" ? error : ""}
    />
  );
}
