import { getAppContext } from "@/helpers/getAppContext";
import { findCategoryById } from "@/models/categoryModel";

export const getCategoryController: ControllerFn = async (c) => {
  await getAppContext(c);
  const id = c.req.param("id");

  if (!id) {
    return c.json({ message: "ID da categoria não informado" }, 400);
  }

  const category = await findCategoryById(id, c.env);

  if (!category) {
    return c.json({ message: "Categoria não encontrada" }, 404);
  }

  return c.json({ category }, 200);
};