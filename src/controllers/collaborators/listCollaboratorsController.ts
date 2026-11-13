import { findAllCollaborators } from "@/models/CollaboratorModel";

export const listCollaboratorsController = async (c: any) => {
    const env = c.env;
    const collaborators = await findAllCollaborators(env);

    return new Response(JSON.stringify({ collaborators }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });

}

