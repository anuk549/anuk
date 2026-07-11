import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'portfolio';

let client;
let db;

export async function getDb() {
  if (db) return db;
  if (!MONGO_URI) {
    throw new Error('MONGODB_URI is not configured');
  }
  if (!client) {
    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30_000,
      serverSelectionTimeoutMS: 10_000,
    });
    await client.connect();
  }
  db = client.db(DB_NAME);
  return db;
}

export function collection(name) {
  return getDb().then((d) => d.collection(name));
}

export { ObjectId };

export default { getDb, collection, ObjectId };
