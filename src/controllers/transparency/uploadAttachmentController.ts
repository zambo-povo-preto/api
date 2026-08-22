import { getAppContext } from "@/helpers/getAppContext";
import { createAttachmentMetadata } from "@/models/attachmentModel";
import { findFileById } from "@/models/fileModel";

export const uploadAttachmentController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const documentId = c.req.param("id");
  const {
    fileName,
    description,
    contentType,
    contentBase64,
    issuerName,
    issuerDoc,
    invoiceNumber,
    amount,
    issueDate,
    expenseType,
  } = inputs;

  if (!documentId || !fileName || !contentBase64 || !contentType) {
    return c.json(
      {
        message:
          "Os campos documentId, fileName, contentType e contentBase64 são obrigatórios",
      },
      400,
    );
  }

  const document = await findFileById(documentId, c.env);
  if (!document) {
    return c.json({ message: "Documento principal não encontrado" }, 404);
  }

  const safeFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const objectKey = `attachments/${documentId}/${Date.now()}-${safeFileName}`;
  const body = Uint8Array.from(atob(contentBase64), (char) =>
    char.charCodeAt(0),
  );
  const size = body.length;

  await c.env.R2_BUCKET.put(objectKey, body, {
    httpMetadata: {
      contentType,
    },
  });

  const parsedAmount =
    amount !== undefined && amount !== null && amount !== ""
      ? Number(amount)
      : null;

  const attachment = await createAttachmentMetadata(
    {
      documentId,
      name: fileName,
      description: description ?? null,
      objectKey,
      contentType,
      size,
      issuerName: issuerName ?? null,
      issuerDoc: issuerDoc ?? null,
      invoiceNumber: invoiceNumber ?? null,
      amount: parsedAmount,
      issueDate: issueDate ?? null,
      expenseType: expenseType ?? null,
    },
    c.env,
  );

  return c.json({ attachment }, 201);
};
