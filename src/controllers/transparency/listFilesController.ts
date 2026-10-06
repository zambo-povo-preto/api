import { getAppContext } from "@/helpers/getAppContext";
import { toPublicFileDTO } from "@/helpers/transparencySerializers";
import { tryGetAuthenticatedUser } from "@/helpers/tryGetAuthenticatedUser";
import { findAllFiles } from "@/models/fileModel";

/**
 * Controller de listagem de relatórios/documentos.
 *
 * REQUISITO LGPD & ARQUITETURA:
 * - Se for acesso administrativo autenticado: retorna todos os documentos (rascunhos e publicados).
 * - Se for acesso público: retorna apenas documentos publicados, formatados pelo contrato público.
 */
export const listFilesController: ControllerFn = async (c) => {
  await getAppContext(c);
  const user = await tryGetAuthenticatedUser(c);
  const categoryId = c.req.query("categoryId");

  if (user) {
    // Acesso administrativo: retorna todos os arquivos
    const files = await findAllFiles(c.env, { categoryId, onlyPublished: false });
    return c.json({ files }, 200);
  }

  // Acesso público: retorna apenas arquivos publicados no DTO público
  const files = await findAllFiles(c.env, { categoryId, onlyPublished: true });
  const baseUrl = new URL(c.req.url).origin;
  const publicFiles = files.map((f) => toPublicFileDTO(f, baseUrl));

  return c.json({ files: publicFiles }, 200);
};
