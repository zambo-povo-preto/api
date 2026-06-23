import { Hono } from "hono";
import { uploadFileController } from "@/controllers/transparency/uploadFileController";
import { listFilesController } from "@/controllers/transparency/listFilesController";
import { downloadFileController } from "@/controllers/transparency/downloadFileController";
import { authMiddleware } from "@/middlewares/authMiddleware";

const app = new Hono();

app.get("/files", listFilesController);
app.post("/files/upload", authMiddleware, uploadFileController);
app.get("/files/:id/download", downloadFileController);

export { app as transparencyRouter };