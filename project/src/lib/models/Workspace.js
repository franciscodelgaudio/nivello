import { dbConnect } from "@/lib/handler/db";
import mongoose from "mongoose";

const WorkspacesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        teamId: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
            default: "",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
    },
    {
        timestamps: true,
    }
);

await dbConnect();

export const Workspaces = mongoose.models.workspaces || mongoose.model("workspaces", WorkspacesSchema);
