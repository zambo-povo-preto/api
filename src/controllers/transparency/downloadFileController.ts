import { getAppContext } from "@/helpers/getAppContext";
import { tryGetAuthenticatedUser } from "@/helpers/tryGetAuthenticatedUser";
import { findFileById } from "@/models/fileModel";

/**
 * Controller de download do documento principal de transparência.
 */
export const downloadFileController: ControllerFn = async (c) => {
  await getAppContext(c);
  const user = await tryGetAuthenticatedUser(c);

  const id = c.req.param("id");
  if (!id) {
    return c.json({ message: "ID do arquivo não informado" }, 400);
  }

  const file = await findFileById(id, c.env);
  if (!file) {
    return c.json({ message: "Arquivo não encontrado" }, 404);
  }

  // Se o usuário não for autenticado, o documento precisa estar publicado
  if (!user && !file.publishedAt) {
    return c.json(
      { message: "Documento não disponível para acesso público" },
      404,
    );
  }

  // Prioriza o arquivo público sanitizado se configurado, ou arquivo principal
  const targetObjectKey = file.publicObjectKey || file.objectKey;
  const object = await c.env.R2_BUCKET.get(targetObjectKey);

  if (!object || !object.body) {
    return c.json(
      { message: "Arquivo não encontrado no armazenamento" },
      404,
    );
  }

  const isInline = c.req.query("inline") === "true";
  const disposition = isInline ? "inline" : "attachment";

  return c.body(object.body, 200, {
    "Content-Type": file.contentType,
    "Content-Disposition": `${disposition}; filename="${file.name}"`,
  });
};
