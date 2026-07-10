import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'portfolio';

// One-shot diagnostic so Vercel logs reveal what's actually being read at runtime
// (without ever logging the secret itself).
if (!globalThis.__dbMongoDiagLogged) {
  globalThis.__dbMongoDiagLogged = true;
  const hasPlaceholder = MONGO_URI.includes('<') && MONGO_URI.includes('>');
  const first20 = MONGO_URI.slice(0, 20);
  const endsWithWhitespace = MONGO_URI.length !== MONGO_URI.trim().length;
  console.log(
    `[db-mongo] MONGODB_URI diagnostic: ` +
      `length=${MONGO_URI.length} ` +
      `prefix="${first20}..." ` +
      `hasPlaceholder=${hasPlaceholder} ` +
      `hasWhitespace=${endsWithWhitespace}`
  );
}

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
