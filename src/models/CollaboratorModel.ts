// Define o tipo que a API vai devolver
export type Collaborator = {
    id: string;
    name: string;
    role: string;
    description: string | null;
    photoUrl: string | null;
    socialLink: string | null;
    socialLabel: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

// Função para que as datas fiquem sempre no formato correto
const formatTimestamp = (value: unknown) => {
    if (!value) return "";
    return typeof value === "string"
        ? value
        : value instanceof Date
            ? value.toISOString()
            : String(value);
};

const mapCollaboratorRow = (row: Record<string, unknown>) =>
    ({
        id: String(row.id),
        name: String(row.name),
        role: String(row.role),
        description: row.description ? String(row.description) : null,
        photoUrl: row.photoUrl ? String(row.photoUrl) : null,
        socialLink: row.socialLink ? String(row.socialLink) : null,
        socialLabel: row.socialLabel ? String(row.socialLabel) : null,
        active: Boolean(row.active),
        createdAt: formatTimestamp(row.createdAt),
        updatedAt: formatTimestamp(row.updatedAt),
    }) as Collaborator;

// Criar colaborador
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
        .bind(
            id,
            data.name,
            data.role,
            data.description ?? null,
            data.photoUrl ?? null,
            data.socialLink ?? null,
            data.socialLabel ?? null,
            1,
            now,
            now,
        )
        .all();

    const collaborator = res.results?.[0];
    if (!collaborator) return null;

    // Atualizámos o create para usar também o mapCollaboratorRow!
    return mapCollaboratorRow(collaborator as Record<string, unknown>);
};

// Buscar todos os colaboradores
export const findAllCollaborators = async (env: any) => {
    const res = await env.DB.prepare(`
      SELECT * FROM collaborators ORDER BY name ASC
    `).all();

    return (res.results ?? []).map((row: any) =>
        mapCollaboratorRow(row as Record<string, unknown>),
    );
};

// Busca os colaboradores de acordo com ID
export const findCollaboratorById = async (id: string, env: any) => {
    const res = await env.DB.prepare(`
        SELECT * FROM collaborators WHERE id = ?
    `)
        .bind(id)
        .all();

    const collaborator = res.results?.[0];
    if (!collaborator) return null;

    return mapCollaboratorRow(collaborator as Record<string, unknown>);
};

// Atualizar um colaborador (Update)
export const updateCollaborator = async (
    id: string,
    data: {
        name?: string;
        role?: string;
        description?: string | null;
        photoUrl?: string | null;
        socialLink?: string | null;
        socialLabel?: string | null;
        active?: boolean;
    },
    env: any,
) => {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) { updates.push("name = ?"); params.push(data.name); }
    if (data.role !== undefined) { updates.push("role = ?"); params.push(data.role); }
    if (data.description !== undefined) { updates.push("description = ?"); params.push(data.description); }
    if (data.photoUrl !== undefined) { updates.push("photoUrl = ?"); params.push(data.photoUrl); }
    if (data.socialLink !== undefined) { updates.push("socialLink = ?"); params.push(data.socialLink); }
    if (data.socialLabel !== undefined) { updates.push("socialLabel = ?"); params.push(data.socialLabel); }
    if (data.active !== undefined) { updates.push("active = ?"); params.push(data.active ? 1 : 0); }

    if (updates.length === 0) return findCollaboratorById(id, env);

    updates.push("updatedAt = ?");
    params.push(new Date().toISOString());
    params.push(id);

    const res = await env.DB.prepare(`
      UPDATE collaborators
      SET ${updates.join(", ")}
      WHERE id = ?
      RETURNING *
    `)
        .bind(...params)
        .all();

    const collaborator = res.results?.[0];
    if (!collaborator) return null;

    return mapCollaboratorRow(collaborator as Record<string, unknown>);
};

// Apagar um colaborador 
export const deleteCollaborator = async (id: string, env: any) => {
    await env.DB.prepare(`
      DELETE FROM collaborators WHERE id = ?
    `)
        .bind(id)
        .run();
};