import { dbConnect } from "@/lib/handler/db";
import mongoose from "mongoose";

const ProductsSchema = new mongoose.Schema({
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

await dbConnect();

export const Products = mongoose.models.products || mongoose.model("products", ProductsSchema);
