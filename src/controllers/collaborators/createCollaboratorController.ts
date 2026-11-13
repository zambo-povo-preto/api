import { getAppContext } from "@/helpers/getAppContext";
import { createCollaborator } from "../../models/CollaboratorModel";

export const createCollaboratorController = async (c: any) => {
    const { inputs } = await getAppContext(c);
    const { name, role, description, photoUrl, socialLink, socialLabel } = inputs;

    if (!name || !role) {
        return c.json({ message: "Os campos 'name' e 'role' são obrigatórios." }, 400);
    }

    const collaborator = await createCollaborator(
        { name, role, description, photoUrl, socialLink, socialLabel },
        c.env,
    );

    return c.json({ collaborator }, 201);
};