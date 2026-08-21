/**
  * Migration: 0002_seed_initial_data.sql
  * Seed initial admin user for SANDBOX environment.
  ***/

-- Admin user (admin@zambo.org.br / zambo2024)
INSERT INTO users (id, name, email, password_hash)
VALUES (
  '01J0ADMINZAMBOUSER00000000',
  'Administrador Zambô',
  'admin@zambo.org.br',
  '100000.163UtWbnBfUJe7eJ7pRyhQ.hvAt1ZYFo-0ZQrX5RqZ0_rlDhGM9qiP9ysAec9Lr-T4'
) ON CONFLICT(email) DO NOTHING;

-- Default document categories
INSERT INTO categories (id, name, description)
VALUES 
  ('cat-prestacao-contas', 'Prestação de Contas', 'Documentos de prestações de contas financeiras e orçamentárias'),
  ('cat-relatorio-atividades', 'Relatório de Atividades', 'Relatórios periódicos de atividades e impacto de projetos'),
  ('cat-plano-trabalho', 'Plano de Trabalho', 'Planos de trabalho, diretrizes e metas de projetos'),
  ('cat-ata-reuniao', 'Ata de Reunião', 'Atas formais de reuniões da diretoria e conselho'),
  ('cat-edital', 'Edital', 'Editais públicos, chamadas e processos seletivos')
ON CONFLICT(id) DO NOTHING;
