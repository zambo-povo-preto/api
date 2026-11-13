import { Hono } from 'hono';
import { createCollaboratorController } from '../controllers/collaborators/createCollaboratorController';
import { listCollaboratorsController } from '@/controllers/collaborators/listCollaboratorsController';
import { updateCollaboratorController } from '@/controllers/collaborators/updateCollaboratorController';
import { deleteCollaboratorController } from '@/controllers/collaborators/deleteCollaboratorController';

const collaboratorRouter = new Hono();

collaboratorRouter.post('/', createCollaboratorController);
collaboratorRouter.get('/', listCollaboratorsController);
collaboratorRouter.patch('/:id', updateCollaboratorController);
collaboratorRouter.delete('/:id', deleteCollaboratorController);

export { collaboratorRouter };