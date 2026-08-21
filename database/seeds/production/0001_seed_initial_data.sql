/**
  * Seed: 0001_seed_initial_data.sql
  * Seed initial admin user for PRODUCTION environment.
  *
  ***/

-- Admin user for Production
INSERT INTO users (id, name, email, password_hash)
VALUES (
  '01J0ADMINZAMBOUSER00000000',
  'Administrador Zambô',
  'admin@zambo.org.br',
  '100000.MWpBg9G8dLOOTa_lrHbM1Q.Op-6dqtPcJxvDNbhkvT3T1sPdfzLP8oEqE_e7aGJf8A'
) ON CONFLICT(email) DO NOTHING;
