import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
}

let clientPromise = globalThis._mongoClientPromise;

if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = globalThis._mongoClientPromise = client.connect();
}

export default clientPromise;
