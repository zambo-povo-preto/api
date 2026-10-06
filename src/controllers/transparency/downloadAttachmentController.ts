import { getAppContext } from "@/helpers/getAppContext";
import { tryGetAuthenticatedUser } from "@/helpers/tryGetAuthenticatedUser";
import { findAttachmentById } from "@/models/attachmentModel";

/**
 * Controller de download de anexo / comprovante.
 *
 * REQUISITO LGPD & SEGURANÇA:
 * - O cidadão NÃO pode ter acesso ao arquivo original não sanitizado se ele puder
 *   conter dados pessoais desnecessários (CPF, endereço, dados bancários, assinaturas).
 * - Portanto, se o usuário não for administrador autenticado, este endpoint
 *   disponibiliza APENAS o `public_object_key`.
 * - Se `public_object_key` não estiver configurado para o item, a consulta pública
 *   retorna erro 404/403 informando que a versão pública não está disponível.
 * - Administradores autenticados podem baixar o arquivo original para conferência contábil.
 */
export const downloadAttachmentController: ControllerFn = async (c) => {
  await getAppContext(c);
  const user = await tryGetAuthenticatedUser(c);

  const attachmentId = c.req.param("attachmentId");
  if (!attachmentId) {
    return c.json({ message: "ID do anexo não informado" }, 400);
  }

  const attachment = await findAttachmentById(attachmentId, c.env);
  if (!attachment) {
    return c.json({ message: "Anexo não encontrado" }, 404);
  }

  // Define qual arquivo baixar:
  let targetObjectKey: string | null = null;

  if (user) {
    // Administrador autenticado: pode acessar o arquivo original ou o público
    targetObjectKey = attachment.publicObjectKey || attachment.objectKey;
  } else {
    // Cidadão público: EXCLUSIVAMENTE o arquivo público sanitizado
    if (!attachment.publicObjectKey) {
      return c.json(
        {
          message:
            "O arquivo público deste comprovante ainda não foi disponibilizado para consulta externa.",
        },
        404,
      );
    }
    targetObjectKey = attachment.publicObjectKey;
  }

  const object = await c.env.R2_BUCKET.get(targetObjectKey);
  if (!object || !object.body) {
    return c.json(
      { message: "Arquivo de anexo não encontrado no armazenamento" },
      404,
    );
  }

  const isInline = c.req.query("inline") === "true";
  const disposition = isInline ? "inline" : "attachment";

  return c.body(object.body, 200, {
    "Content-Type": attachment.contentType,
    "Content-Disposition": `${disposition}; filename="${attachment.name}"`,
  });
};
