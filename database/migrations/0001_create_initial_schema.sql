/**
  * Migration: 0001_create_initial_schema.sql
  * Author: Giselle Hoekveld Silva
  * Created at: 2026-03-31T00:10:26.077Z
  * Description: Initialize D1 schema for users, categories, and transparency files.
***/

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transparency_files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  object_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  category_id TEXT NULL,
  uploaded_by TEXT NOT NULL,
  published_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_transparency_files_category_id ON transparency_files(category_id);

-- Default document categories
INSERT INTO categories (id, name, description)
VALUES 
  ('cat-prestacao-contas', 'Prestação de Contas', 'Documentos de prestações de contas financeiras e orçamentárias'),
  ('cat-relatorio-atividades', 'Relatório de Atividades', 'Relatórios periódicos de atividades e impacto de projetos'),
  ('cat-plano-trabalho', 'Plano de Trabalho', 'Planos de trabalho, diretrizes e metas de projetos'),
  ('cat-ata-reuniao', 'Ata de Reunião', 'Atas formais de reuniões da diretoria e conselho'),
  ('cat-edital', 'Edital', 'Editais públicos, chamadas e processos seletivos')
ON CONFLICT(id) DO NOTHING;