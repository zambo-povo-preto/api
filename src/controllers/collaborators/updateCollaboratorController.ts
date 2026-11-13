import { updateCollaborator, findCollaboratorById } from "@/models/CollaboratorModel";

export const updateCollaboratorController = async (c: any) => {
    const env = c.env;
    const id = c.req.param("id");

    const body = await c.req.json();

    const existing = await findCollaboratorById(id, env);
    if (!existing) {
        return c.json({ message: "Colaborador não encontrado." }, 404);
    }

    const updatedCollaborator = await updateCollaborator(id, body, env);

    return c.json({ message: "Colaborador atualizado!", collaborator: updatedCollaborator }, 200);
};