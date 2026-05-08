-- TimescaleDB compression + retention for the positions hypertable.
-- Run once. Idempotent (uses IF NOT EXISTS / try-add patterns).
--
-- Outcomes:
--   * Chunks older than 7 days get auto-compressed (~10× space saving).
--   * Chunks older than 90 days get auto-dropped.
--   * Compression segments by mmsi (fast per-vessel queries on cold data).
--   * Compression orders by ts DESC (most recent rows first inside each segment).

-- Enable compression on positions table
ALTER TABLE positions SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'mmsi',
  timescaledb.compress_orderby   = 'ts DESC'
);

-- Compression policy: compress chunks older than 7 days
SELECT add_compression_policy('positions', INTERVAL '7 days', if_not_exists => TRUE);

-- Retention policy: drop chunks older than 90 days
SELECT add_retention_policy('positions', INTERVAL '90 days', if_not_exists => TRUE);

-- Reduce future chunk size from 1d → 6h for higher ingest rate (better compression locality).
-- Affects only NEW chunks, not existing ones.
SELECT set_chunk_time_interval('positions', INTERVAL '6 hours');

-- Show resulting policy state
SELECT
  hypertable_name,
  num_chunks,
  compression_enabled,
  (SELECT COUNT(*) FROM timescaledb_information.chunks
    WHERE hypertable_name = h.hypertable_name AND is_compressed) AS compressed_chunks
FROM timescaledb_information.hypertables h
WHERE hypertable_name = 'positions';
