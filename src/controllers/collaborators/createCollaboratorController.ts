import { Context } from 'hono';
import { PrismaClient } from '../../../generated/prisma/client';
import { createCollaborator } from '../../models/CollaboratorModel';


export const createCollaboratorController = async (c: Context) => {

    const prisma = c.get('prisma') as PrismaClient;

    try {
        const body = await c.req.json();

        const { name, role, description, photoUrl, socialLink, socialLabel } = body;

        if (!name || !role) {
            return c.json({ error: 'Os campos "name" e "role" são obrigatórios.' }, 400);
        }

        const newCollaborator = await createCollaborator(prisma, {
            name,
            role,
            description,
            photoUrl,
            socialLink,
            socialLabel,
        });

        return c.json({ message: 'Colaborador criado com sucesso!', collaborator: newCollaborator }, 201);

    } catch (error) {
        console.error('Erro ao criar colaborador:', error);
        return c.json({ error: 'Erro interno ao criar um colaborador' }, 500);
    }
};