import { getAppContext } from "@/helpers/getAppContext";
import { findAttachmentById, updateAttachmentMetadata } from "@/models/attachmentModel";

export const updateAttachmentController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const attachmentId = c.req.param("attachmentId");
  if (!attachmentId) {
    return c.json({ message: "ID do anexo não informado" }, 400);
  }

  const currentAttachment = await findAttachmentById(attachmentId, c.env);
  if (!currentAttachment) {
    return c.json({ message: "Anexo/Nota fiscal não encontrada" }, 404);
  }

  const {
    fileName,
    description,
    documentId,
    attachmentType,
    isPublicSafe,
    publicObjectKey,
    issuerName,
    issuerDoc,
    invoiceNumber,
    amount,
    issueDate,
    expenseType,
  } = inputs;

  const parsedAmount =
    amount !== undefined && amount !== null && amount !== ""
      ? Number(amount)
      : amount === null
        ? null
        : undefined;

  let resolvedPublicKey = publicObjectKey !== undefined ? publicObjectKey : undefined;
  if (isPublicSafe === true) {
    resolvedPublicKey = currentAttachment.objectKey;
  } else if (isPublicSafe === false) {
    resolvedPublicKey = null;
  }

  const updatedAttachment = await updateAttachmentMetadata(
    attachmentId,
    {
      name: fileName !== undefined ? String(fileName) : undefined,
      description: description !== undefined ? (description ? String(description) : null) : undefined,
      documentId: documentId !== undefined ? (documentId ? String(documentId) : null) : undefined,
      attachmentType: attachmentType !== undefined ? (attachmentType as "invoice" | "document") : undefined,
      publicObjectKey: resolvedPublicKey,
      issuerName: issuerName !== undefined ? (issuerName ? String(issuerName) : null) : undefined,
      issuerDoc: issuerDoc !== undefined ? (issuerDoc ? String(issuerDoc) : null) : undefined,
      invoiceNumber: invoiceNumber !== undefined ? (invoiceNumber ? String(invoiceNumber) : null) : undefined,
      amount: parsedAmount,
      issueDate: issueDate !== undefined ? (issueDate ? String(issueDate) : null) : undefined,
      expenseType: expenseType !== undefined ? (expenseType ? String(expenseType) : null) : undefined,
    },
    c.env,
  );

  if (!updatedAttachment) {
    return c.json({ message: "Erro ao atualizar o anexo" }, 500);
  }

  return c.json({ attachment: updatedAttachment }, 200);
};
