-- Agent password reset (forgot-password flow via email link)

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX password_reset_tokens_user_id_idx ON password_reset_tokens (user_id);
CREATE UNIQUE INDEX password_reset_tokens_pending_hash_uidx
  ON password_reset_tokens (token_hash)
  WHERE used_at IS NULL;

COMMENT ON TABLE password_reset_tokens IS 'SHA-256 hashes of single-use reset tokens; raw token sent by email only';
