/**
  * Migration: 0003_add_invoice_fields_to_attachments.sql
  * Description: Add rich metadata fields to document_attachments for invoice/receipt tracking.
  ***/

ALTER TABLE document_attachments ADD COLUMN issuer_name TEXT;
ALTER TABLE document_attachments ADD COLUMN issuer_doc TEXT;
ALTER TABLE document_attachments ADD COLUMN invoice_number TEXT;
ALTER TABLE document_attachments ADD COLUMN amount REAL;
ALTER TABLE document_attachments ADD COLUMN issue_date TEXT;
ALTER TABLE document_attachments ADD COLUMN expense_type TEXT;

CREATE INDEX IF NOT EXISTS idx_document_attachments_issuer_name ON document_attachments(issuer_name);
CREATE INDEX IF NOT EXISTS idx_document_attachments_issuer_doc ON document_attachments(issuer_doc);
CREATE INDEX IF NOT EXISTS idx_document_attachments_expense_type ON document_attachments(expense_type);
