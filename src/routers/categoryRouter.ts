import { Hono } from "hono";
import { listCategoriesController } from "@/controllers/categories/listCategoriesController";
import { getCategoryController } from "@/controllers/categories/getCategoryController";
import { createCategoryController } from "@/controllers/categories/createCategoryController";
import { updateCategoryController } from "@/controllers/categories/updateCategoryController";
import { deleteCategoryController } from "@/controllers/categories/deleteCategoryController";

const app = new Hono();

app.get("/", listCategoriesController);
app.get("/:id", getCategoryController);
app.post("/", createCategoryController);
app.put("/:id", updateCategoryController);
app.delete("/:id", deleteCategoryController);

export { app as categoryRouter };