import { deleteAttachmentController } from "@/controllers/transparency/deleteAttachmentController";
import { deleteFileController } from "@/controllers/transparency/deleteFileController";
import { downloadAttachmentController } from "@/controllers/transparency/downloadAttachmentController";
import { downloadFileController } from "@/controllers/transparency/downloadFileController";
import { linkAttachmentController } from "@/controllers/transparency/linkAttachmentController";
import { listAttachmentsController } from "@/controllers/transparency/listAttachmentsController";
import { listFilesController } from "@/controllers/transparency/listFilesController";
import { toggleFileStatusController } from "@/controllers/transparency/toggleFileStatusController";
import { updateAttachmentController } from "@/controllers/transparency/updateAttachmentController";
import { updateFileController } from "@/controllers/transparency/updateFileController";
import { uploadAttachmentController } from "@/controllers/transparency/uploadAttachmentController";
import { uploadFileController } from "@/controllers/transparency/uploadFileController";
import { uploadPublicFileController } from "@/controllers/transparency/uploadPublicFileController";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Hono } from "hono";

/**
 * ============================================================================
 * CONTRATO E ROTAS DO PORTAL DA TRANSPARÊNCIA (ZAMBÔ)
 * ============================================================================
 * Esta API é pública e deve retornar somente os dados necessários para a
 * finalidade de transparência. Não adicionar dados pessoais administrativos
 * a este contrato sem avaliação específica.
 * ============================================================================
 */

const app = new Hono();

// ── 1. Rotas de Relatórios / Publicações Principais ─────────────────────────
// Listagem pública / administrativa (segregação por token e LGPD)
app.get("/files", listFilesController);

// Download de arquivo (público entrega versão pública/sanitizada se publicada)
app.get("/files/:id/download", downloadFileController);

// Download original restrito para administradores
app.get("/files/:id/download/original", authMiddleware, downloadFileController);

// Operações de gestão de relatórios (autenticadas)
app.post("/files/upload", authMiddleware, uploadFileController);
app.put("/files/:id", authMiddleware, updateFileController);
app.delete("/files/:id", authMiddleware, deleteFileController);
app.patch("/files/:id/status", authMiddleware, toggleFileStatusController);
app.post("/files/:id/public-file", authMiddleware, uploadPublicFileController);

// ── 2. Rotas de Notas Fiscais e Documentos Complementares ─────────────────
// Listagem geral de comprovantes (com segregação LGPD para não-autenticados)
app.get("/files/attachments", listAttachmentsController);

// Listagem de comprovantes vinculados a um relatório específico
app.get("/files/:id/attachments", listAttachmentsController);

// Upload autônomo (não exige relatório prévio)
app.post("/files/attachments", authMiddleware, uploadAttachmentController);

// Upload vinculado a um relatório específico
app.post("/files/:id/attachments", authMiddleware, uploadAttachmentController);

// Atualização de dados fiscais / metadados do comprovante
app.put("/files/attachments/:attachmentId", authMiddleware, updateAttachmentController);

// Vincular / desvincular comprovante a um relatório
app.patch("/files/attachments/:attachmentId/link", authMiddleware, linkAttachmentController);

// Upload de arquivo público sanitizado para o comprovante
app.post("/files/attachments/:attachmentId/public-file", authMiddleware, uploadPublicFileController);

// Download de anexo (para o público: EXCLUSIVAMENTE public_object_key se existir)
app.get("/files/attachments/:attachmentId/download", downloadAttachmentController);

// Download original de anexo para administradores autenticados
app.get("/files/attachments/:attachmentId/download/original", authMiddleware, downloadAttachmentController);

// Exclusão de anexo
app.delete("/files/attachments/:attachmentId", authMiddleware, deleteAttachmentController);

export { app as transparencyRouter };
