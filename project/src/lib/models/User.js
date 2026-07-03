import { dbConnect } from "@/lib/handler/db";
import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    emailVerified: {
        type: Date,
        default: null,
    },
    image: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
})

await dbConnect();

export const Users = mongoose.models.users || mongoose.model("users", UsersSchema);
