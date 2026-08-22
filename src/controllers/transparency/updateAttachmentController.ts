import { getAppContext } from "@/helpers/getAppContext";
import { updateAttachmentMetadata } from "@/models/attachmentModel";

export const updateAttachmentController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const attachmentId = c.req.param("attachmentId");
  if (!attachmentId) {
    return c.json({ message: "ID da nota fiscal não informado" }, 400);
  }

  const {
    fileName,
    description,
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
      : undefined;

  const updatedAttachment = await updateAttachmentMetadata(
    attachmentId,
    {
      name: fileName,
      description: description !== undefined ? description : undefined,
      issuerName: issuerName !== undefined ? issuerName : undefined,
      issuerDoc: issuerDoc !== undefined ? issuerDoc : undefined,
      invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : undefined,
      amount: parsedAmount,
      issueDate: issueDate !== undefined ? issueDate : undefined,
      expenseType: expenseType !== undefined ? expenseType : undefined,
    },
    c.env,
  );

  if (!updatedAttachment) {
    return c.json({ message: "Nota fiscal não encontrada" }, 404);
  }

  return c.json({ attachment: updatedAttachment }, 200);
};
