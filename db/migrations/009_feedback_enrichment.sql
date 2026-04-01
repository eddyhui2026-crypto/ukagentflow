-- Agent workflow, buyer profile fields for vendor reports, GDPR-friendly exports.

CREATE TYPE agent_follow_up AS ENUM ('new', 'called', 'followed_up');
CREATE TYPE buyer_position AS ENUM ('first_time_buyer', 'chain_free', 'cash_buyer', 'other');

ALTER TABLE feedback
  ADD COLUMN agent_follow_up agent_follow_up NOT NULL DEFAULT 'new',
  ADD COLUMN buyer_position buyer_position NULL,
  ADD COLUMN has_aip boolean NULL,
  ADD COLUMN property_highlights text NOT NULL DEFAULT '',
  ADD COLUMN negative_feedback_tags text NOT NULL DEFAULT '';

CREATE INDEX feedback_agent_follow_up_idx ON feedback (agent_follow_up);
CREATE INDEX feedback_interest_submitted_idx ON feedback (interest_level, submitted_at DESC);
