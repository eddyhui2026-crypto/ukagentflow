-- Text templates for “copy email draft” when agents send invites from their own mailbox.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS agent_copy_invite_subject_template text,
  ADD COLUMN IF NOT EXISTS agent_copy_invite_body_template text;
