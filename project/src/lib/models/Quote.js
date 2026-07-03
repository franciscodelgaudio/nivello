import mongoose from "mongoose";

const QuotesSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "workspaces",
        required: true,
    },
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
}, {
    timestamps: true,
})

export const Quotes = mongoose.models.quotes || mongoose.model("quotes", QuotesSchema);
