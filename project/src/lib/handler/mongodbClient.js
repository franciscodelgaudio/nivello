import { MongoClient } from "mongodb";

// Lazily create a (non-connected) MongoClient. Reading the env and creating the
// client happens on first use (a request), never at import/build time — the
// MongoDB team recommends passing a non-connected client to the Auth.js adapter.
export function getMongoClient() {
    if (!globalThis._mongoClient) {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error("Missing MONGODB_URI environment variable");
        }

        globalThis._mongoClient = new MongoClient(MONGODB_URI);
    }

    return globalThis._mongoClient;
}
