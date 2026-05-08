-- Adds entity + entity_relation tables for ownership-graph features.
-- Idempotent. Run via: docker compose exec -T postgres psql -U shadow -d shadow -f /tmp/this.sql
-- Or auto-run from packages/api/src/cli/load-ownership.ts before ingest.

CREATE TABLE IF NOT EXISTS entities (
  id            TEXT PRIMARY KEY,        -- OpenSanctions FtM entity ID
  schema_type   TEXT NOT NULL,           -- Vessel | Company | Person | LegalEntity | Address | etc.
  caption       TEXT NOT NULL,
  countries     TEXT[],
  imo           BIGINT,                  -- denormalized for vessel fast lookup
  topics        TEXT[],
  datasets      TEXT[],
  url           TEXT,
  properties    JSONB,
  first_seen    TIMESTAMPTZ DEFAULT NOW(),
  last_updated  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS entities_imo_idx     ON entities (imo) WHERE imo IS NOT NULL;
CREATE INDEX IF NOT EXISTS entities_schema_idx  ON entities (schema_type);
CREATE INDEX IF NOT EXISTS entities_topics_idx  ON entities USING GIN (topics);

CREATE TABLE IF NOT EXISTS entity_relations (
  id            TEXT PRIMARY KEY,        -- OpenSanctions FtM relation ID
  rel_type      TEXT NOT NULL,           -- Ownership | Directorship | Membership | UnknownLink | Family
  src_id        TEXT NOT NULL,           -- the owner / director (the "from" side)
  dst_id        TEXT NOT NULL,           -- the owned / directed (the "to" side)
  role          TEXT,
  percentage    REAL,
  start_date    DATE,
  end_date      DATE,
  properties    JSONB,
  first_seen    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rel_src_idx  ON entity_relations (src_id);
CREATE INDEX IF NOT EXISTS rel_dst_idx  ON entity_relations (dst_id);
CREATE INDEX IF NOT EXISTS rel_type_idx ON entity_relations (rel_type);
