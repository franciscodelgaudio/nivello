import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import Display from "@/components/dashboard/workspaceId/clients/Display";
import { getLocale } from "@/lib/i18n/locale";
import { Clients } from "@/lib/models/Client";
import { listWorkspacesForOwner, Workspaces } from "@/lib/models/Workspace";

const PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE, 10) || 20;
const ORDER_VALUES = ["name", "address", "createdAt"];
const DIRECTION_VALUES = ["asc", "desc"];
const FILTER_VALUES = ["all", "active", "inactive"];

const querySchema = z.object({
  search: z
    .string()
    .optional()
    .transform((val) => (val ? val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : val)),
  page: z
    .string()
    .optional()
    .refine((val) => !val || (/^\d+$/.test(val) && parseInt(val, 10) > 0), {
      message: "Page must be a positive integer string",
    })
    .refine(
      (val) => {
        if (!val) return true;
        const num = Number(val);
        return Number.isSafeInteger(num) && num <= Number.MAX_SAFE_INTEGER;
      },
      {
        message: "Page number is too large",
      }
    ),
  order: z.enum(ORDER_VALUES).optional().default("name"),
  direction: z.enum(DIRECTION_VALUES).optional().default("asc"),
  filter: z.enum(FILTER_VALUES).optional().default("all"),
});

export default async function Page({ searchParams, params }) {
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

  const queryResult = querySchema.safeParse(await searchParams);
  if (!queryResult.success) return notFound();

  const { search, page, order, direction, filter } = queryResult.data;

  const searchTerms = search
    ? search
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.length > 0)
    : [];

  const searchConditions =
    searchTerms.length > 0
      ? searchTerms.map((term) => ({
          $or: [
            { name: { $regex: term, $options: "i" } },
            { address: { $regex: term, $options: "i" } },
            { cellphone: { $regex: term, $options: "i" } },
          ],
        }))
      : null;

  let currentPage = parseInt(page || "1", 10);
  if (isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  }

  let skip = (currentPage - 1) * PAGE_SIZE;
  if (isNaN(skip) || skip < 0) {
    skip = 0;
  }

  const sortDirections = {
    asc: 1,
    desc: -1,
  };

  const dir = sortDirections[direction];

  const sortOptions = {
    name: { name: dir },
    address: { address: dir },
    createdAt: { createdAt: dir },
  };
  const sortBy = sortOptions[order];

  const pipeline = [
    {
      $match: {
        workspaceId: workspaceObjectId,
      },
    },
    {
      $lookup: {
        from: "works",
        let: { clientId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$clientId", "$$clientId"] } } },
          {
            $addFields: {
              status: {
                $switch: {
                  branches: [
                    { case: { $lt: ["$deadline", "$$NOW"] }, then: "late" },
                    { case: { $gt: ["$startDate", "$$NOW"] }, then: "planned" },
                  ],
                  default: "active",
                },
              },
            },
          },
          { $sort: { createdAt: -1 } },
        ],
        as: "works",
      },
    },
    {
      $lookup: {
        from: "quotes",
        let: { clientId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$clientId", "$$clientId"] } } },
          {
            $lookup: {
              from: "products",
              localField: "products",
              foreignField: "_id",
              as: "products",
            },
          },
          { $addFields: { quoteTotal: { $sum: "$products.total" } } },
          { $group: { _id: null, total: { $sum: "$quoteTotal" } } },
        ],
        as: "quoteAgg",
      },
    },
    {
      $addFields: {
        activeWorkCount: {
          $size: { $filter: { input: "$works", as: "w", cond: { $eq: ["$$w.status", "active"] } } },
        },
        lastWork: { $arrayElemAt: ["$works.name", 0] },
        totalValue: { $ifNull: [{ $arrayElemAt: ["$quoteAgg.total", 0] }, 0] },
      },
    },
  ];

  if (filter === "active") {
    pipeline.push({ $match: { activeWorkCount: { $gt: 0 } } });
  } else if (filter === "inactive") {
    pipeline.push({ $match: { activeWorkCount: 0 } });
  }

  if (searchConditions && searchConditions.length > 0) {
    pipeline.push({
      $match: {
        $and: searchConditions,
      },
    });
  }

  const aggregationResult = await Clients.aggregate([
    ...pipeline,
    {
      $facet: {
        data: [
          { $sort: sortBy },
          { $skip: skip },
          { $limit: PAGE_SIZE },
          {
            $project: {
              _id: 1,
              name: 1,
              address: 1,
              cellphone: 1,
              activeWorkCount: 1,
              lastWork: 1,
              totalValue: 1,
              createdAt: 1,
              workspaceId: 1,
            },
          },
        ],
        count: [{ $count: "total" }],
      },
    },
  ]);

  const totalCount =
    aggregationResult[0].count.length > 0 ? aggregationResult[0].count[0].total : 0;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  const facet = aggregationResult[0].data;
  const clients = JSON.parse(JSON.stringify(facet));

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
      clients={clients}
      pagination={{
        page: currentPage,
        totalPages,
        totalCount,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      }}
      search={search || ""}
      order={order}
      direction={direction}
      filter={filter}
      locale={locale}
    />
  );
}
