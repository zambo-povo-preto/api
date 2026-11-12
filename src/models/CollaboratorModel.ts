import { PrismaClient } from '../../generated/prisma/client';

export const createCollaborator = async (

    prisma: PrismaClient,
    data: {
        name: string;
        role: string;
        description?: string;
        photoUrl?: string;
        socialLink?: string;
        socialLabel?: string;

    }
) => {
    return await prisma.collaborator.create({
        data,
    });
};

export const listCollaborators = async (prisma: PrismaClient) => {
    return await prisma.collaborator.findMany({
        orderBy: { createdAt: 'desc' }
    })
}