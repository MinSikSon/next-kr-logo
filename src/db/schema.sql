-- Cloudflare D1 schema for kr-logo-db
CREATE TABLE IF NOT EXISTS logos (
  ticker       TEXT PRIMARY KEY,   -- Korean stock ticker (e.g. "005930")
  name_ko      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  category     TEXT NOT NULL,      -- matches Category type in src/types/logo.ts
  brand_color  TEXT NOT NULL,      -- hex color e.g. "#1428A0"
  initial      TEXT NOT NULL,      -- display text in SVG fallback
  initial_color TEXT,              -- defaults to white when NULL
  image_ext    TEXT,               -- file extension in R2: svg | png | jpg (NULL = no image)
  founded      INTEGER NOT NULL
);

-- Example seed row
-- INSERT INTO logos VALUES ('005930','삼성전자','Samsung Electronics','전자','#1428A0','S',NULL,'png',1969);
