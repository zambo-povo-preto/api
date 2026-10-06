import { getAppContext } from "@/helpers/getAppContext";
import { findAttachmentById, linkAttachmentToDocument } from "@/models/attachmentModel";
import { findFileById } from "@/models/fileModel";

/**
 * Controller para vincular ou desvincular um anexo/nota fiscal a um relatório.
 * Permite que notas fiscais e documentos cadastrados independentemente sejam
 * associados a um relatório sem duplicação de dados ou arquivos.
 */
export const linkAttachmentController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const attachmentId = c.req.param("attachmentId");
  if (!attachmentId) {
    return c.json({ message: "ID do anexo não informado" }, 400);
  }

  const attachment = await findAttachmentById(attachmentId, c.env);
  if (!attachment) {
    return c.json({ message: "Anexo não encontrado" }, 404);
  }

  const targetDocId = inputs.documentId ? String(inputs.documentId) : null;

  // Se estiver vinculando a um relatório, valida se ele existe
  if (targetDocId) {
    const document = await findFileById(targetDocId, c.env);
    if (!document) {
      return c.json({ message: "Relatório de destino não encontrado" }, 404);
    }
  }

  const updated = await linkAttachmentToDocument(attachmentId, targetDocId, c.env);
  return c.json({ attachment: updated }, 200);
};
