-- TOP 100 PERFORMERS MTD — schema
CREATE TABLE action_etf (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  rank INT NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  name TEXT,
  type VARCHAR(10),
  price_now DECIMAL(20,4),
  price_month_start DECIMAL(20,4),
  performance_pct DECIMAL(10,4),
  market_cap BIGINT,
  volume BIGINT,
  sector VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_date, symbol)
);

CREATE INDEX idx_snapshot_date ON action_etf(snapshot_date);
CREATE INDEX idx_symbol ON action_etf(symbol);
