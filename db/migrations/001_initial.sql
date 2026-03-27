-- UKAgentFlow MVP — core schema (Neon / PostgreSQL)
-- Run once: npm run db:migrate

CREATE TYPE interest_level AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE price_opinion AS ENUM ('too_high', 'fair', 'good_value');

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'agent',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);

CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  address text NOT NULL,
  postcode text NOT NULL,
  vendor_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX properties_company_id_idx ON properties (company_id);

CREATE TABLE viewings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  viewing_date date NOT NULL,
  agent_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX viewings_property_id_idx ON viewings (property_id);
CREATE INDEX viewings_agent_id_idx ON viewings (agent_id);

CREATE TABLE buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);

CREATE INDEX buyers_company_id_idx ON buyers (company_id);

CREATE TABLE viewing_buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewing_id uuid NOT NULL REFERENCES viewings (id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES buyers (id) ON DELETE CASCADE,
  feedback_token text NOT NULL UNIQUE,
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamptz,
  token_invalidated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (viewing_id, buyer_id)
);

CREATE INDEX viewing_buyers_token_idx ON viewing_buyers (feedback_token);

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewing_id uuid NOT NULL REFERENCES viewings (id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES buyers (id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  interest_level interest_level NOT NULL,
  price_opinion price_opinion NOT NULL,
  liked_text text,
  disliked_text text,
  wants_second_viewing boolean NOT NULL,
  comment text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (viewing_id, buyer_id)
);

CREATE INDEX feedback_viewing_id_idx ON feedback (viewing_id);
