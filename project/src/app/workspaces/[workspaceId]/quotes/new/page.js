import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
import Display from "@/components/dashboard/workspaceId/quotes/new/Display";
import { getLocale } from "@/lib/i18n/locale";
import { listWorkspacesForOwner, Workspaces } from "@/lib/models/Workspace";

export default async function NewQuotePage({ params }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    notFound();
  }

  const ownerObjectId = new mongoose.Types.ObjectId(session.user.id);

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: new mongoose.Types.ObjectId(workspaceId),
    owner: ownerObjectId,
  }).lean();

  if (!workspace) {
    notFound();
  }

  const workspaces = await listWorkspacesForOwner(ownerObjectId);
  const locale = await getLocale();

  return (
    <Display
      workspaceId={workspace._id.toString()}
      workspaceName={workspace.name}
      workspaces={workspaces}
      userName={session.user.name ?? session.user.email}
      userEmail={session.user.email}
      locale={locale}
    />
  );
}
