import { redirect } from "next/navigation";
import mongoose from "mongoose";

import { auth } from "@/auth";
import { Workspaces } from "@/lib/models/Workspace";

export default async function RootPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const ownerObjectId = new mongoose.Types.ObjectId(session.user.id);

  let workspace = await Workspaces.findOne({ owner: ownerObjectId }).lean();

  // Se não tiver workspace, criar um padrão
  if (!workspace) {
    workspace = await Workspaces.create({
      name: "Workspace Padrão",
      teamId: ownerObjectId.toString(),
      owner: ownerObjectId,
    });
    workspace = workspace.toObject ? workspace.toObject() : workspace;
  }

  redirect(`/workspaces/${workspace._id.toString()}`);
}
