import { redirect } from "next/navigation";
import mongoose from "mongoose";

import { auth } from "@/auth";
import Display from "@/components/dashboard/Display";
import { Clients } from "@/lib/models/Client";
import { Quotes } from "@/lib/models/Quote";
import { Workspaces } from "@/lib/models/Workspace";
import { Works } from "@/lib/models/Work";

export default async function DashboardPage() {
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

  const workspaceObjectId = workspace._id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [quotesThisMonth, activeWorks, totalClients] = await Promise.all([
    Quotes.countDocuments({ workspaceId: workspaceObjectId, createdAt: { $gte: startOfMonth } }),
    Works.countDocuments({ workspaceId: workspaceObjectId, deadline: { $gte: now } }),
    Clients.countDocuments({ workspaceId: workspaceObjectId }),
  ]);

  return (
    <Display
      workspaceId={workspaceObjectId.toString()}
      workspaceName={workspace.name}
      userName={session.user.name ?? session.user.email}
      metrics={{
        quotesThisMonth,
        activeWorks,
        totalClients,
      }}
    />
  );
}
