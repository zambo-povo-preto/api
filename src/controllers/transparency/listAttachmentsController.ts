import { getAppContext } from "@/helpers/getAppContext";
import {
  findAllAttachments,
  findAttachmentsByDocumentId,
} from "@/models/attachmentModel";

export const listAttachmentsController: ControllerFn = async (c) => {
  await getAppContext(c);

  const documentId = c.req.param("id");
  const searchQuery = c.req.query("q") || c.req.query("search");

  if (documentId) {
    const attachments = await findAttachmentsByDocumentId(documentId, c.env);
    return c.json({ attachments });
  }

  const attachments = await findAllAttachments(c.env, searchQuery);
  return c.json({ attachments });
};
