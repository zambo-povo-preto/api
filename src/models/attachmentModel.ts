import { DatabaseError } from "@/errors/DatabaseError";

export type AttachmentMetadata = {
  id: string;
  documentId: string | null;
  name: string;
  description: string | null;
  objectKey: string;
  publicObjectKey: string | null;
  contentType: string;
  size: number;
  attachmentType: "invoice" | "document";
  createdAt: string;
  issuerName: string | null;
  issuerDoc: string | null;
  invoiceNumber: string | null;
  amount: number | null;
  issueDate: string | null;
  expenseType: string | null;
};

// Helper mapper for database record to AttachmentMetadata
// biome-ignore lint/suspicious/noExplicitAny: D1 query row object
const mapAttachmentRecord = (att: Record<string, any>): AttachmentMetadata => ({
  id: String(att.id),
  documentId: att.document_id ? String(att.document_id) : null,
  name: String(att.name),
  description: att.description ? String(att.description) : null,
  objectKey: String(att.object_key),
  publicObjectKey: att.public_object_key ? String(att.public_object_key) : null,
  contentType: String(att.content_type),
  size: Number(att.size),
  attachmentType: (att.attachment_type as "invoice" | "document") || "invoice",
  createdAt: String(att.created_at),
  issuerName: att.issuer_name ? String(att.issuer_name) : null,
  issuerDoc: att.issuer_doc ? String(att.issuer_doc) : null,
  invoiceNumber: att.invoice_number ? String(att.invoice_number) : null,
  amount: att.amount !== null && att.amount !== undefined ? Number(att.amount) : null,
  issueDate: att.issue_date ? String(att.issue_date) : null,
  expenseType: att.expense_type ? String(att.expense_type) : null,
});

export const createAttachmentMetadata = async (
  {
    documentId,
    name,
    description,
    objectKey,
    publicObjectKey,
    contentType,
    size,
    attachmentType = "invoice",
    issuerName,
    issuerDoc,
    invoiceNumber,
    amount,
    issueDate,
    expenseType,
  }: {
    documentId?: string | null;
    name: string;
    description?: string | null;
    objectKey: string;
    publicObjectKey?: string | null;
    contentType: string;
    size: number;
    attachmentType?: "invoice" | "document";
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
    (id, document_id, name, description, object_key, public_object_key, content_type, size, attachment_type, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id, document_id, name, description, object_key, public_object_key, content_type, size, attachment_type, created_at, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type
  `;

  const res = await env.DB.prepare(query)
    .bind(
      id,
      documentId ?? null,
      name,
      description ?? null,
      objectKey,
      publicObjectKey ?? null,
      contentType,
      size,
      attachmentType,
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

export const findAttachmentsByDocumentId = async (
  documentId: string,
  env: Bindings,
  options?: {
    attachmentType?: "invoice" | "document";
  },
) => {
  let query = `
    SELECT id, document_id, name, description, object_key, public_object_key, content_type, size, attachment_type, created_at, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type
    FROM document_attachments
    WHERE document_id = ?
  `;

  const bindings: unknown[] = [documentId];

  if (options?.attachmentType) {
    query += ` AND attachment_type = ?`;
    bindings.push(options.attachmentType);
  }

  query += ` ORDER BY created_at ASC`;

  const res = await env.DB.prepare(query).bind(...bindings).all();
  return (res.results ?? []).map(mapAttachmentRecord);
};

export const findAllAttachments = async (
  env: Bindings,
  options?: {
    searchQuery?: string;
    allowDocSearch?: boolean; // Se false (padrão para acesso público), NÃO pesquisa por CPF/CNPJ
    documentId?: string | null;
    attachmentType?: "invoice" | "document";
    unlinkedOnly?: boolean;
    onlyPublished?: boolean; // Para o portal público, apenas anexos de relatórios publicados
  },
) => {
  const {
    searchQuery,
    allowDocSearch = false,
    documentId,
    attachmentType,
    unlinkedOnly,
    onlyPublished,
  } = options || {};

  let query = `
    SELECT a.id, a.document_id, a.name, a.description, a.object_key, a.public_object_key,
           a.content_type, a.size, a.attachment_type, a.created_at, a.issuer_name,
           a.issuer_doc, a.invoice_number, a.amount, a.issue_date, a.expense_type
    FROM document_attachments a
  `;

  if (onlyPublished) {
    query += ` INNER JOIN transparency_files tf ON a.document_id = tf.id AND tf.published_at IS NOT NULL`;
  }

  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (documentId !== undefined) {
    if (documentId === null) {
      conditions.push("a.document_id IS NULL");
    } else {
      conditions.push("a.document_id = ?");
      bindings.push(documentId);
    }
  }

  if (unlinkedOnly) {
    conditions.push("a.document_id IS NULL");
  }

  if (attachmentType) {
    conditions.push("a.attachment_type = ?");
    bindings.push(attachmentType);
  }

  if (searchQuery && searchQuery.trim() !== "") {
    const term = `%${searchQuery.trim().toLowerCase()}%`;

    // LGPD: A busca pública NUNCA pesquisa pelo CPF do favorecido
    if (allowDocSearch) {
      conditions.push(`(
        LOWER(a.name) LIKE ?
        OR LOWER(COALESCE(a.description, '')) LIKE ?
        OR LOWER(COALESCE(a.issuer_name, '')) LIKE ?
        OR LOWER(COALESCE(a.issuer_doc, '')) LIKE ?
        OR LOWER(COALESCE(a.invoice_number, '')) LIKE ?
        OR LOWER(COALESCE(a.expense_type, '')) LIKE ?
      )`);
      bindings.push(term, term, term, term, term, term);
    } else {
      conditions.push(`(
        LOWER(a.name) LIKE ?
        OR LOWER(COALESCE(a.description, '')) LIKE ?
        OR LOWER(COALESCE(a.issuer_name, '')) LIKE ?
        OR LOWER(COALESCE(a.invoice_number, '')) LIKE ?
        OR LOWER(COALESCE(a.expense_type, '')) LIKE ?
      )`);
      bindings.push(term, term, term, term, term);
    }
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY a.created_at DESC`;

  const stmt = env.DB.prepare(query);
  const res = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();

  return (res.results ?? []).map(mapAttachmentRecord);
};

export const findAttachmentById = async (id: string, env: Bindings) => {
  const res = await env.DB.prepare(`
    SELECT id, document_id, name, description, object_key, public_object_key, content_type, size, attachment_type, created_at, issuer_name, issuer_doc, invoice_number, amount, issue_date, expense_type
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
    documentId,
    attachmentType,
    publicObjectKey,
    issuerName,
    issuerDoc,
    invoiceNumber,
    amount,
    issueDate,
    expenseType,
  }: {
    name?: string;
    description?: string | null;
    documentId?: string | null;
    attachmentType?: "invoice" | "document";
    publicObjectKey?: string | null;
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
  const newDocumentId =
    documentId !== undefined ? documentId : attachment.documentId;
  const newAttachmentType =
    attachmentType !== undefined ? attachmentType : attachment.attachmentType;
  const newPublicObjectKey =
    publicObjectKey !== undefined ? publicObjectKey : attachment.publicObjectKey;
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
    SET name = ?, description = ?, document_id = ?, attachment_type = ?, public_object_key = ?, issuer_name = ?, issuer_doc = ?, invoice_number = ?, amount = ?, issue_date = ?, expense_type = ?
    WHERE id = ?
  `)
    .bind(
      newName,
      newDescription,
      newDocumentId,
      newAttachmentType,
      newPublicObjectKey,
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

export const linkAttachmentToDocument = async (
  id: string,
  documentId: string | null,
  env: Bindings,
) => {
  await env.DB.prepare(`
    UPDATE document_attachments
    SET document_id = ?
    WHERE id = ?
  `)
    .bind(documentId, id)
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
