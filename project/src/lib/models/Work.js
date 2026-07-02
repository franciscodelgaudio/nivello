import { dbConnect } from "@/lib/handler/db";
import mongoose from "mongoose";

const WorksSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: null,
        required: false,
    },
    startDate: {
        type: Date,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "clients",
        required: true,
    },
})

await dbConnect();

export const Works = mongoose.models.works || mongoose.model("works", WorksSchema);
