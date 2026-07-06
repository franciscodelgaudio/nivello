import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
import Display from "@/components/dashboard/workspaceId/quotes/new/step-1/Display";
import { createQuote } from "@/lib/actions/quote";
import { getLocale } from "@/lib/i18n/locale";
import { Clients } from "@/lib/models/Client";
import { Works } from "@/lib/models/Work";
import { listWorkspacesForOwner, Workspaces } from "@/lib/models/Workspace";

export default async function NewQuoteStepOnePage({ params }) {
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

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: workspaceObjectId,
    owner: ownerObjectId,
  }).lean();

  if (!workspace) {
    notFound();
  }

  const [clients, works, workspaces] = await Promise.all([
    Clients.find({ workspaceId: workspaceObjectId }).select("_id name").sort({ name: 1 }).lean(),
    Works.find({ workspaceId: workspaceObjectId }).select("_id name").sort({ name: 1 }).lean(),
    listWorkspacesForOwner(ownerObjectId),
  ]);

  const locale = await getLocale();

  return (
    <Display
      workspaceId={workspace._id.toString()}
      workspaceName={workspace.name}
      workspaces={workspaces}
      userName={session.user.name ?? session.user.email}
      userEmail={session.user.email}
      userRole={session.user.role}
      clients={JSON.parse(JSON.stringify(clients))}
      works={JSON.parse(JSON.stringify(works))}
      createQuote={createQuote.bind(null, workspace._id.toString())}
      locale={locale}
    />
  );
}
