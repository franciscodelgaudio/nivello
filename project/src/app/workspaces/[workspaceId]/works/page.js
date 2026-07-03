import z from "zod";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import Display from "@/components/dashboard/workspaceId/works/Display";
import { dbConnect } from "@/lib/handler/db";
import { getLocale } from "@/lib/i18n/locale";
import { Workspaces } from "@/lib/models/Workspace";
import { Works } from "@/lib/models/Work";

const PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE, 10) || 20;
const ORDER_VALUES = ["name", "client", "deadline", "createdAt"];
const DIRECTION_VALUES = ["asc", "desc"];
const FILTER_VALUES = ["all", "active", "late", "planned"];

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
  order: z.enum(ORDER_VALUES).optional().default("deadline"),
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
            { address: { $regex: term, $options: "i" } },
            { "client.name": { $regex: term, $options: "i" } },
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
    deadline: { deadline: dir },
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
        from: "quotes",
        let: { workId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$workId", "$$workId"] } } },
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
        status: {
          $switch: {
            branches: [
              { case: { $lt: ["$deadline", "$$NOW"] }, then: "late" },
              { case: { $gt: ["$startDate", "$$NOW"] }, then: "planned" },
            ],
            default: "active",
          },
        },
        totalValue: { $ifNull: [{ $arrayElemAt: ["$quoteAgg.total", 0] }, 0] },
      },
    },
  ];

  if (filter !== "all") {
    pipeline.push({ $match: { status: filter } });
  }

  if (searchConditions && searchConditions.length > 0) {
    pipeline.push({
      $match: {
        $and: searchConditions,
      },
    });
  }

  const aggregationResult = await Works.aggregate([
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
              startDate: 1,
              deadline: 1,
              status: 1,
              totalValue: 1,
              createdAt: 1,
              "client.name": 1,
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
  const works = JSON.parse(JSON.stringify(facet));

  const locale = await getLocale();

  return (
    <Display
      workspaceId={workspace._id.toString()}
      workspaceName={workspace.name}
      userName={session.user.name ?? session.user.email}
      works={works}
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
