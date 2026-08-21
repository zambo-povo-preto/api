import { getAppContext } from "@/helpers/getAppContext";
import { findCategoryById, updateCategory } from "@/models/categoryModel";

export const updateCategoryController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);
  const id = c.req.param("id");

  const { name, description } = inputs;

  if (!id) {
    return c.json({ message: "ID da categoria não informado" }, 400);
  }

  if (name === undefined && description === undefined) {
    return c.json({ message: "É necessário enviar name ou description" }, 400);
  }

  const category = await findCategoryById(id, c.env);

  if (!category) {
    return c.json({ message: "Categoria não encontrada" }, 404);
  }

  const updatedCategory = await updateCategory(
    id,
    { name, description },
    c.env,
  );

  return c.json({ category: updatedCategory }, 200);
};
