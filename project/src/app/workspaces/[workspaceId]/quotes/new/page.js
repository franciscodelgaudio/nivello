import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import Display from "@/components/dashboard/workspaceId/quotes/new/Display";
import { dbConnect } from "@/lib/handler/db";
import { getLocale } from "@/lib/i18n/locale";
import { Workspaces } from "@/lib/models/Workspace";

export default async function NewQuotePage({ params }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    notFound();
  }

  await dbConnect();

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
      locale={locale}
    />
  );
}
