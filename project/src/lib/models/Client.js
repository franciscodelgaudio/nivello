import mongoose from "mongoose";

const ClientsSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "workspaces",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    cellphone: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
})

export const Clients = mongoose.models.clients || mongoose.model("clients", ClientsSchema);
