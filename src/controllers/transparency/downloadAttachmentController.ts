import { getAppContext } from "@/helpers/getAppContext";
import { findAttachmentById } from "@/models/attachmentModel";

export const downloadAttachmentController: ControllerFn = async (c) => {
  await getAppContext(c);

  const attachmentId = c.req.param("attachmentId");
  if (!attachmentId) {
    return c.json({ message: "ID do anexo não informado" }, 400);
  }

  const attachment = await findAttachmentById(attachmentId, c.env);

  if (!attachment) {
    return c.json({ message: "Anexo não encontrado" }, 404);
  }

  const object = await c.env.R2_BUCKET.get(attachment.objectKey);

  if (!object || !object.body) {
    return c.json({ message: "Arquivo de anexo não encontrado no armazenamento" }, 404);
  }

  const isInline = c.req.query("inline") === "true";
  const disposition = isInline ? "inline" : "attachment";

  return c.body(object.body, 200, {
    "Content-Type": attachment.contentType,
    "Content-Disposition": `${disposition}; filename="${attachment.name}"`,
  });
};
