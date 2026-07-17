import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
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

  await dbConnect();

  const workspace = await Workspaces.findOne({
    _id: workspaceObjectId,
    owner: ownerObjectId,
  }).lean();

  if (!workspace) {
    notFound();
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [quotesThisMonth, activeWorksCount, totalClients, recentQuotes, worksInProgress] = await Promise.all([
    Quotes.countDocuments({ workspaceId: workspaceObjectId, createdAt: { $gte: startOfMonth } }),
    Works.countDocuments({ workspaceId: workspaceObjectId, deadline: { $gte: now } }),
    Clients.countDocuments({ workspaceId: workspaceObjectId }),
    Quotes.aggregate([
      { $match: { workspaceId: workspaceObjectId } },
      { $sort: { createdAt: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "products",
          localField: "products",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $project: {
          name: 1,
          status: 1,
          total: { $sum: "$products.total" },
          "client.name": 1,
        },
      },
    ]),
    Works.aggregate([
      { $match: { workspaceId: workspaceObjectId, startDate: { $lte: now }, deadline: { $gte: now } } },
      { $sort: { deadline: 1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          startDate: 1,
          deadline: 1,
          "client.name": 1,
          progress: {
            $multiply: [
              {
                $divide: [
                  { $subtract: [now, "$startDate"] },
                  { $subtract: ["$deadline", "$startDate"] },
                ],
              },
              100,
            ],
          },
        },
      },
    ]),
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
      userRole={session.user.role}
      metrics={{
        quotesThisMonth,
        activeWorks: activeWorksCount,
        totalClients,
      }}
      recentQuotes={JSON.parse(JSON.stringify(recentQuotes))}
      worksInProgress={JSON.parse(JSON.stringify(worksInProgress))}
      locale={locale}
    />
  );
}
