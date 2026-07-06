import mongoose from "mongoose";

const QuotesSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "workspaces",
        required: true,
    },
    // Número sequencial por workspace (exibido como "Nro." no PDF) — distinto do _id.
    quoteNumber: {
        type: Number,
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
    paymentTerms: {
        type: String,
        default: null,
        required: false,
    },
    deliveryTerm: {
        type: String,
        default: null,
        required: false,
    },
    validityDays: {
        type: Number,
        default: 30,
    },
    taxIncluded: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
})

export const Quotes = mongoose.models.quotes || mongoose.model("quotes", QuotesSchema);
