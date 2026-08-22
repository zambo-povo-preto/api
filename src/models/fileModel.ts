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
  {
    name,
    description,
    objectKey,
    contentType,
    size,
    categoryId,
    uploadedBy,
    published = true,
  }: {
    name: string;
    description: string | null;
    objectKey: string;
    contentType: string;
    size: number;
    categoryId: string | null;
    uploadedBy: string;
    published?: boolean;
  },
  env: Bindings,
) => {
  const id = crypto.randomUUID();
  const publishedAt = published ? new Date().toISOString() : null;

  const query = `
      INSERT INTO transparency_files
      (id, name, description, object_key, content_type, size, category_id, uploaded_by, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id, name, description, object_key, content_type, size, category_id, uploaded_by, published_at, created_at
    `;

  const res = await env.DB.prepare(query)
    .bind(
      id,
      name,
      description,
      objectKey,
      contentType,
      size,
      categoryId,
      uploadedBy,
      publishedAt,
    )
    .all();

  const file = res.results?.[0];
  if (!file) {
    throw new DatabaseError("Failed to create file metadata", {
      values: {
        name,
        description,
        objectKey,
        contentType,
        size,
        categoryId,
        uploadedBy,
      },
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
    publishedAt: file.published_at ? String(file.published_at) : null,
    createdAt: String(file.created_at),
  } as FileMetadata;
};

export const findAllFiles = async (
  env: Bindings,
  categoryId?: string | null,
) => {
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
    id: String(file.id),
    name: String(file.name),
    description: file.description ? String(file.description) : null,
    objectKey: String(file.object_key),
    contentType: String(file.content_type),
    size: Number(file.size),
    categoryId: file.category_id ? String(file.category_id) : null,
    uploadedBy: String(file.uploaded_by),
    publishedAt: file.published_at ? String(file.published_at) : null,
    createdAt: String(file.created_at),
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
    id: String(file.id),
    name: String(file.name),
    description: file.description ? String(file.description) : null,
    objectKey: String(file.object_key),
    contentType: String(file.content_type),
    size: Number(file.size),
    categoryId: file.category_id ? String(file.category_id) : null,
    uploadedBy: String(file.uploaded_by),
    publishedAt: file.published_at ? String(file.published_at) : null,
    createdAt: String(file.created_at),
  } as FileMetadata;
};

export const deleteFileById = async (id: string, env: Bindings) => {
  const file = await findFileById(id, env);
  if (!file) return null;

  await env.DB.prepare(`
      DELETE FROM transparency_files
      WHERE id = ?
    `)
    .bind(id)
    .run();

  return file;
};

export const updateFileMetadata = async (
  id: string,
  {
    name,
    description,
    categoryId,
    published,
  }: {
    name?: string;
    description?: string | null;
    categoryId?: string | null;
    published?: boolean;
  },
  env: Bindings,
) => {
  const file = await findFileById(id, env);
  if (!file) return null;

  const newName = name !== undefined ? name : file.name;
  const newDescription =
    description !== undefined ? description : file.description;
  const newCategoryId =
    categoryId !== undefined ? categoryId : file.categoryId;

  let newPublishedAt = file.publishedAt;
  if (published !== undefined) {
    newPublishedAt = published
      ? file.publishedAt || new Date().toISOString()
      : null;
  }

  await env.DB.prepare(`
      UPDATE transparency_files
      SET name = ?, description = ?, category_id = ?, published_at = ?
      WHERE id = ?
    `)
    .bind(newName, newDescription, newCategoryId, newPublishedAt, id)
    .run();

  return findFileById(id, env);
};

export const toggleFilePublishedStatus = async (id: string, env: Bindings) => {
  const file = await findFileById(id, env);
  if (!file) return null;

  return updateFileMetadata(id, { published: !file.publishedAt }, env);
};


