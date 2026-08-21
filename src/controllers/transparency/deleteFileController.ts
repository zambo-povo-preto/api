import { getAppContext } from "@/helpers/getAppContext";
import { deleteFileById } from "@/models/fileModel";

export const deleteFileController: ControllerFn = async (c) => {
  await getAppContext(c);

  const id = c.req.param("id");
  if (!id) {
    return c.json({ message: "ID do arquivo não informado" }, 400);
  }

  const deletedFile = await deleteFileById(id, c.env);
  if (!deletedFile) {
    return c.json({ message: "Arquivo não encontrado" }, 404);
  }

  try {
    await c.env.R2_BUCKET.delete(deletedFile.objectKey);
  } catch (error) {
    // R2 delete failure shouldn't fail HTTP request if metadata was removed
  }

  return c.json(
    { message: "Arquivo removido com sucesso", file: deletedFile },
    200,
  );
};
