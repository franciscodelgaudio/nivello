import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import Display from "@/components/dashboard/Display";
import { getLocale } from "@/lib/i18n/locale";
import { Clients } from "@/lib/models/Client";
import { Quotes } from "@/lib/models/Quote";
import { listWorkspacesForOwner, Workspaces } from "@/lib/models/Workspace";
import { Works } from "@/lib/models/Work";

export default async function Page({ params }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    notFound();
  }

  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const ownerObjectId = new mongoose.Types.ObjectId(session.user.id);

  const workspace = await Workspaces.findOne({
    _id: workspaceObjectId,
    owner: ownerObjectId,
  }).lean();

  if (!workspace) {
    notFound();
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [quotesThisMonth, activeWorks, totalClients] = await Promise.all([
    Quotes.countDocuments({ workspaceId: workspaceObjectId, createdAt: { $gte: startOfMonth } }),
    Works.countDocuments({ workspaceId: workspaceObjectId, deadline: { $gte: now } }),
    Clients.countDocuments({ workspaceId: workspaceObjectId }),
  ]);

  const workspaces = await listWorkspacesForOwner(ownerObjectId);
  const locale = await getLocale();

  return (
    <Display
      workspaceId={workspace._id.toString()}
      workspaceName={workspace.name}
      workspaces={workspaces}
      userName={session.user.name ?? session.user.email}
      userEmail={session.user.email}
      metrics={{
        quotesThisMonth,
        activeWorks,
        totalClients,
      }}
      locale={locale}
    />
  );
}
