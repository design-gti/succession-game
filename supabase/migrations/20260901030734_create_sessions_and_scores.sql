-- Sessions: one row per game play
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL UNIQUE,
  player_name     TEXT NOT NULL,
  player_email    TEXT NOT NULL,
  player_company  TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  final_pick_id   TEXT NOT NULL
);

-- Scores: one-to-one with sessions
CREATE TABLE scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL REFERENCES sessions(session_id),
  overall_fit     SMALLINT NOT NULL,
  hiring_speed    SMALLINT NOT NULL,
  total           SMALLINT NOT NULL,
  persona         TEXT NOT NULL,
  avg_ttf         SMALLINT NOT NULL,
  current_day     SMALLINT NOT NULL,
  placements      JSONB NOT NULL
);

-- Indexes
CREATE INDEX idx_sessions_email    ON sessions(player_email);
CREATE INDEX idx_scores_session_id ON scores(session_id);
CREATE INDEX idx_scores_total      ON scores(total DESC);

-- RLS: disabled (insert handled server-side only)
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE scores   DISABLE ROW LEVEL SECURITY;
