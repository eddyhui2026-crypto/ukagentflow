-- Sliding-window counters for public feedback POST abuse control (per IP / per token).

CREATE TABLE feedback_submit_rate_events (
  id bigserial PRIMARY KEY,
  bucket text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX feedback_submit_rate_events_bucket_created_idx
  ON feedback_submit_rate_events (bucket, created_at DESC);
