-- Seed generic email domains that should not be used for org matching
INSERT INTO blacklist (type, value, reason) VALUES
  ('domain', 'gmail.com', 'Dominio genérico — no se puede deducir empresa'),
  ('domain', 'hotmail.com', 'Dominio genérico'),
  ('domain', 'outlook.com', 'Dominio genérico'),
  ('domain', 'yahoo.com', 'Dominio genérico'),
  ('domain', 'icloud.com', 'Dominio genérico'),
  ('domain', 'live.com', 'Dominio genérico'),
  ('domain', 'protonmail.com', 'Dominio genérico'),
  ('domain', 'mail.com', 'Dominio genérico')
ON CONFLICT (type, value) DO NOTHING;
