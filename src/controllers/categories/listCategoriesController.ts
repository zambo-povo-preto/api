import { getAppContext } from "@/helpers/getAppContext";
import { findAllCategories } from "@/models/categoryModel";

export const listCategoriesController: ControllerFn = async (c) => {
  await getAppContext(c);
  const categories = await findAllCategories(c.env);
  return c.json({ categories }, 200);
};