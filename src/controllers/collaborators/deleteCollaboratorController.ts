import { deleteCollaborator, findCollaboratorById } from "@/models/CollaboratorModel";


export const deleteCollaboratorController = async (c: any) => {
    const env = c.env;
    const id = c.req.param("id");

    const existing = await findCollaboratorById(id, env);
    if (!existing) {
        return c.json({ message: "Colaborador não encontrado" }, 404);
    }

    await deleteCollaborator(id, env);

    return c.json({ message: "Colaborador apagado com sucesso" }, 200);

};