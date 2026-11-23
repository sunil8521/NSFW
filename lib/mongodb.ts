import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables (.env)");
}

const options = {};

let client: MongoClient;

declare global {
  var _mongoClient: MongoClient | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

export const mongoClient: MongoClient = client;
export const mongoDb: Db = client.db("zpo");

export default client;
