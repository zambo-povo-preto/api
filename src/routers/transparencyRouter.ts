import { deleteFileController } from "@/controllers/transparency/deleteFileController";
import { downloadFileController } from "@/controllers/transparency/downloadFileController";
import { listFilesController } from "@/controllers/transparency/listFilesController";
import { toggleFileStatusController } from "@/controllers/transparency/toggleFileStatusController";
import { uploadFileController } from "@/controllers/transparency/uploadFileController";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Hono } from "hono";

const app = new Hono();

app.get("/files", listFilesController);
app.get("/files/:id/download", downloadFileController);
app.post("/files/upload", authMiddleware, uploadFileController);
app.delete("/files/:id", authMiddleware, deleteFileController);
app.patch("/files/:id/status", authMiddleware, toggleFileStatusController);

export { app as transparencyRouter };
