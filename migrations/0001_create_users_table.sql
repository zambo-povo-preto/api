/**
  * Migration: 0001_create_users_table.sql
  * Author: Giselle Hoekveld Silva
  * Created at: 2026-03-31T00:10:26.077Z
  * Description: Run initial migration to create users and migrations tables
***/

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migrations (id, name, description, author) 
VALUES (1, '0001_create_users_table', 'Run initial migration to create users and migrations tables', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;