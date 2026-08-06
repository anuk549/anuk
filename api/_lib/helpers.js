import { ObjectId } from 'mongodb';

export function toObjectId(id) {
  if (!id) return id;
  return ObjectId.isValid(id) ? new ObjectId(id) : id;
}

export function pick(source, fields) {
  const src = typeof source === 'object' && source !== null ? source : {};
  const out = {};
  for (const field of fields) {
    if (field in src) out[field] = src[field];
  }
  return out;
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function asBoolean(value) {
  return value === true || value === 'true' || value === 1;
}
