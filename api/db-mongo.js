import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI || '';

if (!MONGO_URI) {
  console.error('[db-mongo] Missing environment variable: MONGODB_URI');
}

const DB_NAME = 'portfolio';

let client;
let db;

export async function getDb() {
  if (db) return db;
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  db = client.db(DB_NAME);
  return db;
}

export function collection(name) {
  return getDb().then(d => d.collection(name));
}

export { ObjectId };

export default { getDb, collection, ObjectId };