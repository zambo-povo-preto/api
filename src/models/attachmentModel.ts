import { DatabaseError } from "@/errors/DatabaseError";

export type AttachmentMetadata = {
  id: string;
  documentId: string;
  name: string;
  description: string | null;
  objectKey: string;
  contentType: string;
  size: number;
  createdAt: string;
  issuerName: string | null;
  issuerDoc: string | null;
  invoiceNumber: string | null;
  amount: number | null;
  issueDate: string | null;
  expenseType: string | null;
};

export const createAttachmentMetadata = async (
  {
    documentId,
    name,
    description,
    objectKey,
    contentType,
    size,
    issuerName,
    issuerDoc,
    invoiceNumber,
    amount,
    issueDate,
    expenseType,
  }: {
    documentId: string;
    name: string;
    description?: string | null;
    objectKey: string;
    contentType: string;
    size: number;
    issuerName?: string | null;
    issuerDoc?: string | null;
    invoiceNumber?: string | null;
    amount?: number | null;
    issueDate?: string | null;
    expenseType?: string | null;
  },
  env: Bindings,
) => {
  const id = crypto.randomUUID();

  const query = `
    INSERT INTO document_attachments
    (id, document_id, name, description, object_key, content_type, size, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id, document_id, name, description, object_key, content_type, size, created_at, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type
  `;

  const res = await env.DB.prepare(query)
    .bind(
      id,
      documentId,
      name,
      description ?? null,
      objectKey,
      contentType,
      size,
      issuerName ?? null,
      issuerDoc ?? null,
      invoiceNumber ?? null,
      amount ?? null,
      issueDate ?? null,
      expenseType ?? null,
    )
    .all();

  const attachment = res.results?.[0];
  if (!attachment) {
    throw new DatabaseError("Failed to create attachment metadata", {
      values: { documentId, name, objectKey, contentType, size },
    });
  }

  return mapAttachmentRecord(attachment);
};

// Helper mapper for database record to AttachmentMetadata
// biome-ignore lint/suspicious/noExplicitAny: D1 query row object
const mapAttachmentRecord = (att: Record<string, any>): AttachmentMetadata => ({
  id: String(att.id),
  documentId: String(att.document_id),
  name: String(att.name),
  description: att.description ? String(att.description) : null,
  objectKey: String(att.object_key),
  contentType: String(att.content_type),
  size: Number(att.size),
  createdAt: String(att.created_at),
  issuerName: att.issuer_name ? String(att.issuer_name) : null,
  issuerDoc: att.issuer_doc ? String(att.issuer_doc) : null,
  invoiceNumber: att.invoice_number ? String(att.invoice_number) : null,
  amount: att.amount !== null && att.amount !== undefined ? Number(att.amount) : null,
  issueDate: att.issue_date ? String(att.issue_date) : null,
  expenseType: att.expense_type ? String(att.expense_type) : null,
});

export const findAttachmentsByDocumentId = async (
  documentId: string,
  env: Bindings,
) => {
  const query = `
    SELECT id, document_id, name, description, object_key, content_type, size, created_at, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type
    FROM document_attachments
    WHERE document_id = ?
    ORDER BY created_at ASC
  `;

  const res = await env.DB.prepare(query).bind(documentId).all();
  return (res.results ?? []).map(mapAttachmentRecord);
};

export const findAllAttachments = async (
  env: Bindings,
  searchQuery?: string,
) => {
  let query = `
    SELECT id, document_id, name, description, object_key, content_type, size, created_at, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type
    FROM document_attachments
  `;

  if (searchQuery && searchQuery.trim() !== "") {
    const term = `%${searchQuery.trim().toLowerCase()}%`;
    query += `
      WHERE LOWER(name) LIKE ? 
         OR LOWER(COALESCE(description, '')) LIKE ?
         OR LOWER(COALESCE(issuer_name, '')) LIKE ?
         OR LOWER(COALESCE(issuer_doc, '')) LIKE ?
         OR LOWER(COALESCE(invoice_number, '')) LIKE ?
         OR LOWER(COALESCE(expense_type, '')) LIKE ?
    `;
    query += ` ORDER BY created_at DESC`;
    const res = await env.DB.prepare(query)
      .bind(term, term, term, term, term, term)
      .all();
    return (res.results ?? []).map(mapAttachmentRecord);
  }

  query += ` ORDER BY created_at ASC`;
  const res = await env.DB.prepare(query).all();
  return (res.results ?? []).map(mapAttachmentRecord);
};

export const findAttachmentById = async (id: string, env: Bindings) => {
  const res = await env.DB.prepare(`
    SELECT id, document_id, name, description, object_key, content_type, size, created_at, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type
    FROM document_attachments
    WHERE id = ?
  `)
    .bind(id)
    .all();

  const att = res.results?.[0];
  if (!att) return null;

  return mapAttachmentRecord(att);
};

export const updateAttachmentMetadata = async (
  id: string,
  {
    name,
    description,
    issuerName,
    issuerDoc,
    invoiceNumber,
    amount,
    issueDate,
    expenseType,
  }: {
    name?: string;
    description?: string | null;
    issuerName?: string | null;
    issuerDoc?: string | null;
    invoiceNumber?: string | null;
    amount?: number | null;
    issueDate?: string | null;
    expenseType?: string | null;
  },
  env: Bindings,
) => {
  const attachment = await findAttachmentById(id, env);
  if (!attachment) return null;

  const newName = name !== undefined ? name : attachment.name;
  const newDescription =
    description !== undefined ? description : attachment.description;
  const newIssuerName =
    issuerName !== undefined ? issuerName : attachment.issuerName;
  const newIssuerDoc =
    issuerDoc !== undefined ? issuerDoc : attachment.issuerDoc;
  const newInvoiceNumber =
    invoiceNumber !== undefined ? invoiceNumber : attachment.invoiceNumber;
  const newAmount = amount !== undefined ? amount : attachment.amount;
  const newIssueDate =
    issueDate !== undefined ? issueDate : attachment.issueDate;
  const newExpenseType =
    expenseType !== undefined ? expenseType : attachment.expenseType;

  await env.DB.prepare(`
    UPDATE document_attachments
    SET name = ?, description = ?, issuer_name = ?, issuer_doc = ?, invoice_number = ?, amount = ?, issue_date = ?, expense_type = ?
    WHERE id = ?
  `)
    .bind(
      newName,
      newDescription,
      newIssuerName,
      newIssuerDoc,
      newInvoiceNumber,
      newAmount,
      newIssueDate,
      newExpenseType,
      id,
    )
    .run();

  return findAttachmentById(id, env);
};

export const deleteAttachmentById = async (id: string, env: Bindings) => {
  const attachment = await findAttachmentById(id, env);
  if (!attachment) return null;

  await env.DB.prepare(`
    DELETE FROM document_attachments
    WHERE id = ?
  `)
    .bind(id)
    .run();

  return attachment;
};
