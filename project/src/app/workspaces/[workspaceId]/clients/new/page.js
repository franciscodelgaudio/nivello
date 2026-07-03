import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import Display from "@/components/dashboard/workspaceId/clients/new/Display";
import { createClient } from "@/lib/actions/client";
import { getLocale } from "@/lib/i18n/locale";
import { Workspaces } from "@/lib/models/Workspace";

export default async function NewClientPage({ params }) {
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

  const locale = await getLocale();

  return (
    <Display
      workspaceId={workspace._id.toString()}
      workspaceName={workspace.name}
      userName={session.user.name ?? session.user.email}
      createClient={createClient.bind(null, workspaceId)}
      locale={locale}
    />
  );
}
