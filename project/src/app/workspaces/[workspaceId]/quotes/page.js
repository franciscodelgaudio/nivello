import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
import Display from "@/components/dashboard/workspaceId/quotes/Display";
import { getLocale } from "@/lib/i18n/locale";
import { Clients } from "@/lib/models/Client";
import { Quotes } from "@/lib/models/Quote";
import { Works } from "@/lib/models/Work";
import { listWorkspacesForOwner, Workspaces } from "@/lib/models/Workspace";

const PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE, 10) || 20;
const ORDER_VALUES = ["name", "client", "work", "total", "createdAt"];
const DIRECTION_VALUES = ["asc", "desc"];
const FILTER_VALUES = ["all", "month"];

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
  order: z.enum(ORDER_VALUES).optional().default("createdAt"),
  direction: z.enum(DIRECTION_VALUES).optional().default("desc"),
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

  await dbConnect();

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
            { "client.name": { $regex: term, $options: "i" } },
            { "work.name": { $regex: term, $options: "i" } },
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
    client: { "client.name": dir },
    work: { "work.name": dir },
    total: { total: dir },
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
        from: "clients",
        localField: "clientId",
        foreignField: "_id",
        as: "client",
      },
    },
    { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "works",
        localField: "workId",
        foreignField: "_id",
        as: "work",
      },
    },
    { $unwind: { path: "$work", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "products",
        localField: "products",
        foreignField: "_id",
        as: "products",
      },
    },
    {
      $addFields: {
        total: { $sum: "$products.total" },
        itemCount: { $size: "$products" },
      },
    },
  ];

  if (filter === "month") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    pipeline.push({ $match: { createdAt: { $gte: startOfMonth } } });
  }

  if (searchConditions && searchConditions.length > 0) {
    pipeline.push({
      $match: {
        $and: searchConditions,
      },
    });
  }

  const aggregationResult = await Quotes.aggregate([
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
              quoteNumber: 1,
              name: 1,
              description: 1,
              paymentTerms: 1,
              deliveryTerm: 1,
              validityDays: 1,
              taxIncluded: 1,
              total: 1,
              itemCount: 1,
              createdAt: 1,
              clientId: 1,
              workId: 1,
              "client.name": 1,
              "client.address": 1,
              "client.cellphone": 1,
              "work.name": 1,
              "work.address": 1,
              "work.startDate": 1,
              "work.deadline": 1,
              products: 1,
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
  const quotes = JSON.parse(JSON.stringify(facet));

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
      quotes={quotes}
      clients={JSON.parse(JSON.stringify(clients))}
      works={JSON.parse(JSON.stringify(works))}
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
