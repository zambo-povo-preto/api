import { getAppContext } from "@/helpers/getAppContext";
import { findAttachmentById, updateAttachmentMetadata } from "@/models/attachmentModel";
import { findFileById, updateFileMetadata } from "@/models/fileModel";

/**
 * Controller para upload de versão pública higienizada (LGPD) de documento ou comprovante.
 */
export const uploadPublicFileController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const fileId = c.req.param("id");
  const attachmentId = c.req.param("attachmentId");
  const { fileName, contentType, contentBase64 } = inputs;

  if (!fileName || !contentType || !contentBase64) {
    return c.json(
      { message: "Os campos fileName, contentType e contentBase64 são obrigatórios" },
      400,
    );
  }

  const safeFileName = String(fileName).replace(/[^a-zA-Z0-9_.-]/g, "_");
  const body = Uint8Array.from(atob(String(contentBase64)), (char) =>
    char.charCodeAt(0),
  );

  if (fileId) {
    const file = await findFileById(fileId, c.env);
    if (!file) return c.json({ message: "Relatório não encontrado" }, 404);

    const publicObjectKey = `public/${fileId}/${Date.now()}-${safeFileName}`;
    await c.env.R2_BUCKET.put(publicObjectKey, body, {
      httpMetadata: { contentType: String(contentType) },
    });

    const updated = await updateFileMetadata(fileId, { publicObjectKey }, c.env);
    return c.json({ file: updated }, 200);
  }

  if (attachmentId) {
    const attachment = await findAttachmentById(attachmentId, c.env);
    if (!attachment) return c.json({ message: "Anexo não encontrado" }, 404);

    const folder = attachment.documentId ? `attachments/${attachment.documentId}` : "attachments/standalone";
    const publicObjectKey = `public/${folder}/${Date.now()}-${safeFileName}`;
    await c.env.R2_BUCKET.put(publicObjectKey, body, {
      httpMetadata: { contentType: String(contentType) },
    });

    const updated = await updateAttachmentMetadata(attachmentId, { publicObjectKey }, c.env);
    return c.json({ attachment: updated }, 200);
  }

  return c.json({ message: "Alvo não especificado" }, 400);
};
