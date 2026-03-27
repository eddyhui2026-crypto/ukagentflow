-- Auth.js Credentials: password storage for agents
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash text;

COMMENT ON COLUMN users.password_hash IS 'bcrypt hash; set on registration';
