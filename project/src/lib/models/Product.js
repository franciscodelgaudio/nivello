import mongoose from "mongoose";

const ProductsSchema = new mongoose.Schema({
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
    quantity: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["service", "material"],
        required: true,
    },
})

export const Products = mongoose.models.products || mongoose.model("products", ProductsSchema);
