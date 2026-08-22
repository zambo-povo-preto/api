/**
  * Migration: 0002_create_attachments_schema.sql
  * Description: Create document_attachments table for invoice/receipt attachments.
 ***/

CREATE TABLE IF NOT EXISTS document_attachments (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  object_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES transparency_files(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_attachments_document_id ON document_attachments(document_id);
