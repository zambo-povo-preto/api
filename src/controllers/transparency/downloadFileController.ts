import { getAppContext } from "@/helpers/getAppContext";
import { findFileById } from "@/models/fileModel";

export const downloadFileController: ControllerFn = async (c) => {
  await getAppContext(c);

  const id = c.req.param("id");
  if (!id) {
    return c.json({ message: "ID do arquivo não informado" }, 400);
  }

  const file = await findFileById(id, c.env);

  if (!file) {
    return c.json({ message: "Arquivo não encontrado" }, 404);
  }

  const object = await c.env.R2_BUCKET.get(file.objectKey);

  if (!object || !object.body) {
    return c.json({ message: "Arquivo não encontrado no armazenamento" }, 404);
  }

  return c.body(object.body, 200, {
    "Content-Type": file.contentType,
    "Content-Disposition": `attachment; filename="${file.name}"`,
  });
};