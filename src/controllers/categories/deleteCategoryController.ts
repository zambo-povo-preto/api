import { getAppContext } from "@/helpers/getAppContext";
import { deleteCategory, findCategoryById } from "@/models/categoryModel";

export const deleteCategoryController: ControllerFn = async (c) => {
  await getAppContext(c);
  const id = c.req.param("id");

  const category = await findCategoryById(id, c.env);
  if (!category) {
    return c.json({ message: "Categoria não encontrada" }, 404);
  }

  await deleteCategory(id, c.env);
  return c.json({ message: "Categoria removida com sucesso" }, 200);
};