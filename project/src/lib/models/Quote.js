import { dbConnect } from "@/lib/handler/db";
import mongoose from "mongoose";

const QuotesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: null,
        required: false,
    },
    products: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "products",
        default: [],
    },
    workId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "works",
        required: true,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "clients",
        required: true,
    },
})

await dbConnect();

export const Quotes = mongoose.models.quotes || mongoose.model("quotes", QuotesSchema);
