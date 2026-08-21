export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

const formatTimestamp = (value: unknown) => {
  if (!value) {
    return "";
  }

  return typeof value === "string"
    ? value
    : value instanceof Date
      ? value.toISOString()
      : String(value);
};

const mapCategoryRow = (category: Record<string, unknown>) =>
  ({
    id: String(category.id),
    name: String(category.name),
    description: category.description ? String(category.description) : null,
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

  return mapCategoryRow(category as Record<string, unknown>);
};

export const findAllCategories = async (env: Bindings) => {
  const res = await env.DB.prepare(`
      SELECT id, name, description, created_at
      FROM categories
      ORDER BY name
    `).all();

  return (res.results ?? []).map((row) =>
    mapCategoryRow(row as Record<string, unknown>),
  ) as Category[];
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
  if (!category) return null;
  return mapCategoryRow(category as Record<string, unknown>);
};

export const updateCategory = async (
  id: string,
  { name, description }: { name?: string; description?: string | null },
  env: Bindings,
) => {
  const updates: string[] = [];
  const params: (string | null)[] = [];

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

  return mapCategoryRow(category as Record<string, unknown>);
};

export const deleteCategory = async (id: string, env: Bindings) => {
  await env.DB.prepare(`
      DELETE FROM categories
      WHERE id = ?
    `)
    .bind(id)
    .run();
};
