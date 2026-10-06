/**
  * Migration: 0004_refactor_transparency_lgpd_and_entities.sql
  * Author: Antigravity AI
  * Description:
  * 1. Add public_object_key to transparency_files for LGPD file segregation.
  * 2. Make document_id in document_attachments nullable (ON DELETE SET NULL)
  *    to allow autonomous invoice and document registration before linking.
  * 3. Add attachment_type ('invoice' | 'document') and public_object_key to document_attachments.
  * 4. Safely preserve all existing records and classify legacy rows.
 ***/

-- Step 1: Add public_object_key column to transparency_files
ALTER TABLE transparency_files ADD COLUMN public_object_key TEXT;

-- Step 2: Create new document_attachments table with nullable document_id and new columns
CREATE TABLE IF NOT EXISTS document_attachments_new (
  id TEXT PRIMARY KEY,
  document_id TEXT NULL,
  name TEXT NOT NULL,
  description TEXT,
  object_key TEXT NOT NULL,
  public_object_key TEXT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  attachment_type TEXT NOT NULL DEFAULT 'invoice',
  issuer_name TEXT,
  issuer_doc TEXT,
  invoice_number TEXT,
  amount REAL,
  issue_date TEXT,
  expense_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES transparency_files(id) ON DELETE SET NULL
);

-- Step 3: Copy and migrate existing records with classification
INSERT INTO document_attachments_new (
  id,
  document_id,
  name,
  description,
  object_key,
  public_object_key,
  content_type,
  size,
  attachment_type,
  issuer_name,
  issuer_doc,
  invoice_number,
  amount,
  issue_date,
  expense_type,
  created_at
)
SELECT
  id,
  document_id,
  name,
  description,
  object_key,
  NULL AS public_object_key,
  content_type,
  size,
  CASE
    WHEN invoice_number IS NOT NULL OR amount IS NOT NULL OR issuer_name IS NOT NULL OR issuer_doc IS NOT NULL THEN 'invoice'
    ELSE 'document'
  END AS attachment_type,
  issuer_name,
  issuer_doc,
  invoice_number,
  amount,
  issue_date,
  expense_type,
  created_at
FROM document_attachments;

-- Step 4: Drop old table and rename new table
DROP TABLE document_attachments;
ALTER TABLE document_attachments_new RENAME TO document_attachments;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_document_attachments_document_id ON document_attachments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_attachments_attachment_type ON document_attachments(attachment_type);
CREATE INDEX IF NOT EXISTS idx_document_attachments_issuer_name ON document_attachments(issuer_name);
CREATE INDEX IF NOT EXISTS idx_document_attachments_issuer_doc ON document_attachments(issuer_doc);
CREATE INDEX IF NOT EXISTS idx_document_attachments_expense_type ON document_attachments(expense_type);
