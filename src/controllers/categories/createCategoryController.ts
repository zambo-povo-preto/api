import { getAppContext } from "@/helpers/getAppContext";
import { createCategory } from "@/models/categoryModel";

export const createCategoryController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const { name, description } = inputs;

  if (!name) {
    return c.json({ message: "Nome da categoria é obrigatório" }, 400);
  }

  const category = await createCategory(
    { name, description: description ?? null },
    c.env,
  );

  return c.json({ category }, 201);
};
