import { DatabaseError } from "@/errors/DatabaseError";

export type FileMetadata = {
  id: string;
  name: string;
  description: string | null;
  objectKey: string;
  contentType: string;
  size: number;
  categoryId: string | null;
  uploadedBy: string;
  publishedAt: string | null;
  createdAt: string;
};

export const createFileMetadata = async (
  { name, description, objectKey, contentType, size, categoryId, uploadedBy }: {
    name: string;
    description: string | null;
    objectKey: string;
    contentType: string;
    size: number;
    categoryId: string | null;
    uploadedBy: string;
  },
  env: Bindings,
) => {
  const id = crypto.randomUUID();
  const query = `
      INSERT INTO transparency_files
      (id, name, description, object_key, content_type, size, category_id, uploaded_by, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id, name, description, object_key, content_type, size, category_id, uploaded_by, published_at, created_at
    `;

  const res = await env.DB.prepare(query)
    .bind(id, name, description, objectKey, contentType, size, categoryId, uploadedBy, null)
    .all();

  const file = res.results?.[0];
  if (!file) {
    throw new DatabaseError("Failed to create file metadata", {
      values: { name, description, objectKey, contentType, size, categoryId, uploadedBy },
    });
  }

  return {
    id: file.id,
    name: file.name,
    description: file.description,
    objectKey: file.object_key,
    contentType: file.content_type,
    size: file.size,
    categoryId: file.category_id,
    uploadedBy: file.uploaded_by,
    publishedAt: file.published_at ? file.published_at : null,
    createdAt: file.created_at,
  } as FileMetadata;
};

export const findAllFiles = async (env: Bindings, categoryId?: string | null) => {
  const query = categoryId
    ? `
      SELECT id, name, description, object_key, content_type, size, category_id, created_at, uploaded_by, published_at
      FROM transparency_files
      WHERE category_id = ?
      ORDER BY created_at DESC
    `
    : `
      SELECT id, name, description, object_key, content_type, size, category_id, created_at, uploaded_by, published_at
      FROM transparency_files
      ORDER BY created_at DESC
    `;

  const stmt = env.DB.prepare(query);
  const res = categoryId ? await stmt.bind(categoryId).all() : await stmt.all();

  return (res.results ?? []).map((file) => ({
    id: file.id,
    name: file.name,
    description: file.description,
    objectKey: file.object_key,
    contentType: file.content_type,
    size: file.size,
    categoryId: file.category_id,
    uploadedBy: file.uploaded_by,
    publishedAt: file.published_at ? file.published_at : null,
    createdAt: file.created_at,
  })) as FileMetadata[];
};

export const findFileById = async (id: string, env: Bindings) => {
  const res = await env.DB.prepare(`
      SELECT id, name, description, object_key, content_type, size, category_id, created_at, uploaded_by, published_at
      FROM transparency_files
      WHERE id = ?
    `)
    .bind(id)
    .all();

  const file = res.results?.[0];
  if (!file) {
    return null;
  }

  return {
    id: file.id,
    name: file.name,
    description: file.description,
    objectKey: file.object_key,
    contentType: file.content_type,
    size: file.size,
    categoryId: file.category_id,
    uploadedBy: file.uploaded_by,
    publishedAt: file.published_at ? file.published_at : null,
    createdAt: file.created_at,
  } as FileMetadata;
};