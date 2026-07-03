import mongoose from "mongoose";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/handler/db";
import { Quotes } from "@/lib/models/Quote";
import { Workspaces } from "@/lib/models/Workspace";
import { buildQuotePdf } from "@/lib/pdf/quote-pdf";

export const dynamic = "force-dynamic";

/** Build a safe, ASCII filename slug from arbitrary text. */
function slugify(value, fallback = "presupuesto") {
  const slug = String(value || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40);
  return slug || fallback;
}

/**
 * GET /api/workspaces/[workspaceId]/quotes/[quoteId]/export
 *
 * Streams a quote (orçamento) as a Formighieri-style PDF. Requires an
 * authenticated session that owns the workspace the quote belongs to.
 */
export async function GET(_request, ctx) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { workspaceId, quoteId } = await ctx.params;

  if (
    !mongoose.Types.ObjectId.isValid(workspaceId) ||
    !mongoose.Types.ObjectId.isValid(quoteId)
  ) {
    return new Response("Not found", { status: 404 });
  }

  await dbConnect();

  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const quoteObjectId = new mongoose.Types.ObjectId(quoteId);
  const ownerObjectId = new mongoose.Types.ObjectId(session.user.id);

  const workspace = await Workspaces.findOne({
    _id: workspaceObjectId,
    owner: ownerObjectId,
  }).lean();

  if (!workspace) {
    return new Response("Not found", { status: 404 });
  }

  const aggregation = await Quotes.aggregate([
    { $match: { _id: quoteObjectId, workspaceId: workspaceObjectId } },
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
    { $addFields: { total: { $sum: "$products.total" } } },
  ]);

  const quote = aggregation[0] ? JSON.parse(JSON.stringify(aggregation[0])) : null;

  if (!quote) {
    return new Response("Not found", { status: 404 });
  }

  let pdfBytes;
  try {
    pdfBytes = await buildQuotePdf(quote, { companyName: workspace.name });
  } catch {
    return new Response("Failed to generate PDF", { status: 500 });
  }

  const filename = `presupuesto-${slugify(quote.name)}.pdf`;

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBytes.length),
      "Cache-Control": "no-store",
    },
  });
}
