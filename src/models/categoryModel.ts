export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

const formatTimestamp = (value: any) => {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value.toISOString();
};

const mapCategoryRow = (category: any) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  createdAt: formatTimestamp(category.created_at),
}) as Category;

export const findCategoryById = async (id: string, env: Bindings) => {
  const res = await env.DB.prepare(`
      SELECT id, name, description, created_at
      FROM categories
      WHERE id = ?
    `)
    .bind(id)
    .all();

  const category = res.results?.[0];
  if (!category) {
    return null;
  }

  return mapCategoryRow(category);
};

export const findAllCategories = async (env: Bindings) => {
  const res = await env.DB.prepare(`
      SELECT id, name, description, created_at
      FROM categories
      ORDER BY name
    `)
    .all();

  return (res.results ?? []).map(mapCategoryRow) as Category[];
};

export const createCategory = async (
  { name, description }: { name: string; description: string | null },
  env: Bindings,
) => {
  const id = crypto.randomUUID();
  const res = await env.DB.prepare(`
      INSERT INTO categories (id, name, description)
      VALUES (?, ?, ?)
      RETURNING id, name, description, created_at
    `)
    .bind(id, name, description)
    .all();

  const category = res.results?.[0];
  return mapCategoryRow(category);
};

export const updateCategory = async (
  id: string,
  { name, description }: { name?: string; description?: string | null },
  env: Bindings,
) => {
  const updates: string[] = [];
  const params: any[] = [];

  if (name !== undefined) {
    updates.push("name = ?");
    params.push(name);
  }

  if (description !== undefined) {
    updates.push("description = ?");
    params.push(description);
  }

  if (updates.length === 0) {
    return findCategoryById(id, env);
  }

  params.push(id);

  const res = await env.DB.prepare(`
      UPDATE categories
      SET ${updates.join(", ")}
      WHERE id = ?
      RETURNING id, name, description, created_at
    `)
    .bind(...params)
    .all();

  const category = res.results?.[0];
  if (!category) {
    return null;
  }

  return mapCategoryRow(category);
};

export const deleteCategory = async (id: string, env: Bindings) => {
  await env.DB.prepare(`
      DELETE FROM categories
      WHERE id = ?
    `)
    .bind(id)
    .run();
};