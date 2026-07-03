import z from "zod";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

import Display from "@/components/dashboard/admin/users/Display";
import { requireRole } from "@/lib/handler/session";
import { getLocale } from "@/lib/i18n/locale";
import { listWorkspacesForOwner, Workspaces } from "@/lib/models/Workspace";
import { Users } from "@/lib/models/User";

const PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE, 10) || 20;
const ORDER_VALUES = ["name", "email", "role"];
const DIRECTION_VALUES = ["asc", "desc"];
const ROLE_VALUES = ["admin", "user"];

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
  role: z.enum(ROLE_VALUES).optional(),
});

export default async function AdminUsersPage({ searchParams }) {
  const currentUser = await requireRole("admin");

  const ownerObjectId = new mongoose.Types.ObjectId(currentUser.id);

  let workspace = await Workspaces.findOne({ owner: ownerObjectId }).lean();

  // Se não tiver workspace, criar um padrão (a sidebar precisa de um workspace de contexto)
  if (!workspace) {
    workspace = await Workspaces.create({
      name: "Workspace Padrão",
      teamId: ownerObjectId.toString(),
      owner: ownerObjectId,
    });
    workspace = workspace.toObject ? workspace.toObject() : workspace;
  }

  const workspaces = await listWorkspacesForOwner(ownerObjectId);

  const queryResult = querySchema.safeParse(await searchParams);
  if (!queryResult.success) return notFound();

  const { search, page, order, direction, role } = queryResult.data;

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
            { email: { $regex: term, $options: "i" } },
          ],
        }))
      : null;

  let matchCondition = {};
  const andConditions = [];

  if (role) {
    andConditions.push({ role });
  }

  if (searchConditions && searchConditions.length > 0) {
    andConditions.push(...searchConditions);
  }

  if (andConditions.length > 0) {
    matchCondition = { $and: andConditions };
  }

  let currentPage = parseInt(page || "1", 10);
  if (isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  }

  let skip = (currentPage - 1) * PAGE_SIZE;
  if (isNaN(skip) || skip < 0) {
    skip = 0;
  }

  const sortDirections = { asc: 1, desc: -1 };
  const dir = sortDirections[direction];
  const sortOptions = {
    name: { name: dir },
    email: { email: dir },
    role: { role: dir },
  };
  const sortBy = sortOptions[order];

  const aggregationResult = await Users.aggregate([
    { $match: matchCondition },
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
              email: 1,
              image: 1,
              role: 1,
            },
          },
        ],
        count: [{ $count: "total" }],
      },
    },
  ]);

  const totalCount =
    aggregationResult[0].count.length > 0 ? aggregationResult[0].count[0].total : 0;

  let totalPages = Math.ceil(totalCount / PAGE_SIZE);
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  const users = JSON.parse(JSON.stringify(aggregationResult[0].data));

  const locale = await getLocale();

  return (
    <Display
      workspaceId={workspace._id.toString()}
      workspaceName={workspace.name}
      workspaces={workspaces}
      userName={currentUser.name ?? currentUser.email}
      userEmail={currentUser.email}
      userRole={currentUser.role}
      users={users}
      currentUserId={currentUser.id}
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
      role={role || "all"}
      locale={locale}
    />
  );
}
