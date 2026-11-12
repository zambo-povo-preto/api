import { Hono } from 'hono';
import { createCollaboratorController } from '../controllers/collaborators/createCollaboratorController';

const collaboratorRouter = new Hono();

collaboratorRouter.post('/', createCollaboratorController);

export { collaboratorRouter };