import { createCategoryController } from "@/controllers/categories/createCategoryController";
import { deleteCategoryController } from "@/controllers/categories/deleteCategoryController";
import { getCategoryController } from "@/controllers/categories/getCategoryController";
import { listCategoriesController } from "@/controllers/categories/listCategoriesController";
import { updateCategoryController } from "@/controllers/categories/updateCategoryController";
import { Hono } from "hono";

const app = new Hono();

app.get("/", listCategoriesController);
app.get("/:id", getCategoryController);
app.post("/", createCategoryController);
app.put("/:id", updateCategoryController);
app.delete("/:id", deleteCategoryController);

export { app as categoryRouter };
