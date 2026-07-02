import { dbConnect } from "@/lib/handler/db";
import mongoose from "mongoose";

const ClientsSchema = new mongoose.Schema({
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
})

await dbConnect();

export const Clients = mongoose.models.clients || mongoose.model("clients", ClientsSchema);
