import { getAppContext } from "@/helpers/getAppContext";
import { deleteAttachmentById } from "@/models/attachmentModel";

export const deleteAttachmentController: ControllerFn = async (c) => {
  await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const attachmentId = c.req.param("attachmentId");
  if (!attachmentId) {
    return c.json({ message: "ID do anexo não informado" }, 400);
  }

  const attachment = await deleteAttachmentById(attachmentId, c.env);

  if (!attachment) {
    return c.json({ message: "Anexo não encontrado" }, 404);
  }

  try {
    await c.env.R2_BUCKET.delete(attachment.objectKey);
  } catch {
    // R2 delete error ignored
  }

  return c.json({ message: "Anexo removido com sucesso", attachment });
};
