import { deleteAttachmentController } from "@/controllers/transparency/deleteAttachmentController";
import { deleteFileController } from "@/controllers/transparency/deleteFileController";
import { downloadAttachmentController } from "@/controllers/transparency/downloadAttachmentController";
import { downloadFileController } from "@/controllers/transparency/downloadFileController";
import { listAttachmentsController } from "@/controllers/transparency/listAttachmentsController";
import { listFilesController } from "@/controllers/transparency/listFilesController";
import { toggleFileStatusController } from "@/controllers/transparency/toggleFileStatusController";
import { updateAttachmentController } from "@/controllers/transparency/updateAttachmentController";
import { updateFileController } from "@/controllers/transparency/updateFileController";
import { uploadAttachmentController } from "@/controllers/transparency/uploadAttachmentController";
import { uploadFileController } from "@/controllers/transparency/uploadFileController";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Hono } from "hono";

const app = new Hono();

// Main document routes
app.get("/files", listFilesController);
app.get("/files/:id/download", downloadFileController);
app.post("/files/upload", authMiddleware, uploadFileController);
app.put("/files/:id", authMiddleware, updateFileController);
app.delete("/files/:id", authMiddleware, deleteFileController);
app.patch("/files/:id/status", authMiddleware, toggleFileStatusController);

// Attachment / Invoice routes
app.get("/files/attachments", listAttachmentsController);
app.get("/files/:id/attachments", listAttachmentsController);
app.post("/files/:id/attachments", authMiddleware, uploadAttachmentController);
app.put("/files/attachments/:attachmentId", authMiddleware, updateAttachmentController);
app.get("/files/attachments/:attachmentId/download", downloadAttachmentController);
app.delete("/files/attachments/:attachmentId", authMiddleware, deleteAttachmentController);

export { app as transparencyRouter };
