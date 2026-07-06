import mongoose from "mongoose";

import { PRODUCT_CATEGORIES, PRODUCT_SECTIONS } from "@/lib/constants/quote-items";

const EquipmentSpecsSchema = new mongoose.Schema({
    model: { type: String, default: null, required: false },
    power: { type: String, default: null, required: false },
    voltage: { type: String, default: null, required: false },
    brand: { type: String, default: null, required: false },
    cableSpec: { type: String, default: null, required: false },
    pipeSpec: { type: String, default: null, required: false },
}, { _id: false });

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
    // Derivada de `category` (ver PRODUCT_CATEGORY_META) — usada para agrupar
    // os subtotais do orçamento/PDF (poço tubular, conexão ao tanque, conjunto motobomba).
    section: {
        type: String,
        enum: PRODUCT_SECTIONS,
        required: true,
    },
    category: {
        type: String,
        enum: PRODUCT_CATEGORIES,
        required: true,
    },
    depthFrom: {
        type: Number,
        default: null,
        required: false,
    },
    depthTo: {
        type: Number,
        default: null,
        required: false,
    },
    diameter: {
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
    unitPrice: {
        type: Number,
        required: true,
    },
    // Sempre quantity * unitPrice — recalculado nas actions, nunca aceito direto do cliente.
    total: {
        type: Number,
        required: true,
    },
    equipmentSpecs: {
        type: EquipmentSpecsSchema,
        default: null,
        required: false,
    },
})

export const Products = mongoose.models.products || mongoose.model("products", ProductsSchema);
