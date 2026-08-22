import { getAppContext } from "@/helpers/getAppContext";
import { findCategoryById } from "@/models/categoryModel";
import { updateFileMetadata } from "@/models/fileModel";

export const updateFileController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const id = c.req.param("id");
  if (!id) {
    return c.json({ message: "ID do arquivo não informado" }, 400);
  }

  const { fileName, description, categoryId, published, status } = inputs;

  if (categoryId) {
    const category = await findCategoryById(categoryId, c.env);
    if (!category) {
      return c.json({ message: "Categoria inválida" }, 400);
    }
  }

  const isPublished =
    published !== undefined
      ? Boolean(published)
      : status !== undefined
        ? status === "published"
        : undefined;

  const updatedFile = await updateFileMetadata(
    id,
    {
      name: fileName,
      description: description !== undefined ? description : undefined,
      categoryId: categoryId || undefined,
      published: isPublished,
    },
    c.env,
  );

  if (!updatedFile) {
    return c.json({ message: "Arquivo não encontrado" }, 404);
  }

  return c.json({ file: updatedFile });
};
