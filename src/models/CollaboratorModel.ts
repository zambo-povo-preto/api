export const createCollaborator = async (
    data: {
        name: string;
        role: string;
        description?: string | null;
        photoUrl?: string | null;
        socialLink?: string | null;
        socialLabel?: string | null;
    },
    env: Bindings,
) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const res = await env.DB.prepare(`
      INSERT INTO collaborators (id, name, role, description, photoUrl, socialLink, socialLabel, active, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)
        .bind(id, data.name, data.role, data.description ?? null, data.photoUrl ?? null, data.socialLink ?? null, data.socialLabel ?? null, 1, now, now)
        .all();

    return res.results?.[0] || null;
};