import { getAppContext } from "@/helpers/getAppContext";
import { createAttachmentMetadata } from "@/models/attachmentModel";
import { findFileById } from "@/models/fileModel";

/**
 * Controller para criação de anexo / nota fiscal / comprovante / documento complementar.
 *
 * Suporta:
 * 1. Cadastro vinculado a um relatório (documentId informado na rota ou no payload).
 * 2. Cadastro independente (sem vínculo imediato, documentId = null).
 * 3. Suporte à segregação LGPD: arquivo original obrigatório, arquivo público opcional.
 */
export const uploadAttachmentController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const routeDocId = c.req.param("id");
  const documentId = routeDocId || inputs.documentId || null;

  const {
    fileName,
    description,
    contentType,
    contentBase64,
    publicContentBase64,
    publicFileName,
    attachmentType: explicitType,
    isPublicSafe,
    issuerName,
    issuerDoc,
    invoiceNumber,
    amount,
    issueDate,
    expenseType,
  } = inputs;

  if (!fileName || !contentBase64 || !contentType) {
    return c.json(
      {
        message: "Os campos fileName, contentType e contentBase64 são obrigatórios",
      },
      400,
    );
  }

  // Se vinculando a um relatório, valida se ele existe
  if (documentId) {
    const document = await findFileById(documentId, c.env);
    if (!document) {
      return c.json({ message: "Relatório/Documento principal não encontrado" }, 404);
    }
  }

  // 1. Upload do Arquivo Original (Armazenamento Administrativo Seguro)
  const safeFileName = String(fileName).replace(/[^a-zA-Z0-9_.-]/g, "_");
  const folder = documentId ? `attachments/${documentId}` : "attachments/standalone";
  const originalObjectKey = `${folder}/${Date.now()}-${safeFileName}`;
  const originalBody = Uint8Array.from(atob(String(contentBase64)), (char) =>
    char.charCodeAt(0),
  );
  const size = originalBody.length;

  await c.env.R2_BUCKET.put(originalObjectKey, originalBody, {
    httpMetadata: {
      contentType: String(contentType),
    },
  });

  // 2. Upload do Arquivo Público (se fornecido ou se o admin marcou como seguro)
  let publicObjectKey: string | null = null;

  if (publicContentBase64) {
    const safePublicName = (publicFileName ? String(publicFileName) : safeFileName).replace(
      /[^a-zA-Z0-9_.-]/g,
      "_",
    );
    publicObjectKey = `public/${folder}/${Date.now()}-${safePublicName}`;
    const publicBody = Uint8Array.from(atob(String(publicContentBase64)), (char) =>
      char.charCodeAt(0),
    );
    await c.env.R2_BUCKET.put(publicObjectKey, publicBody, {
      httpMetadata: {
        contentType: String(contentType),
      },
    });
  } else if (isPublicSafe === true) {
    // Se o administrador garantiu que o arquivo original não contém dados pessoais
    publicObjectKey = originalObjectKey;
  }

  // 3. Determina o tipo de anexo ('invoice' ou 'document')
  const attachmentType: "invoice" | "document" =
    explicitType === "document" || explicitType === "invoice"
      ? explicitType
      : invoiceNumber || amount || issuerName || issuerDoc || expenseType
        ? "invoice"
        : "document";

  const parsedAmount =
    amount !== undefined && amount !== null && amount !== ""
      ? Number(amount)
      : null;

  const attachment = await createAttachmentMetadata(
    {
      documentId,
      name: String(fileName),
      description: description ? String(description) : null,
      objectKey: originalObjectKey,
      publicObjectKey,
      contentType: String(contentType),
      size,
      attachmentType,
      issuerName: issuerName ? String(issuerName) : null,
      issuerDoc: issuerDoc ? String(issuerDoc) : null,
      invoiceNumber: invoiceNumber ? String(invoiceNumber) : null,
      amount: parsedAmount,
      issueDate: issueDate ? String(issueDate) : null,
      expenseType: expenseType ? String(expenseType) : null,
    },
    c.env,
  );

  return c.json({ attachment }, 201);
};
