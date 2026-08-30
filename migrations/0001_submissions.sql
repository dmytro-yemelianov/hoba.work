-- What a reader sends when the atlas does not contain what happened to them.
--
-- Deliberately not an entity: a submission is raw testimony, and an entry in
-- the registry is a claim with evidence behind it. Turning one into the other
-- is editorial work, which is why `status` starts at 'new' and nothing here is
-- ever rendered on the site.
CREATE TABLE IF NOT EXISTS submissions (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL,
  lang        TEXT NOT NULL,
  -- Which of the three readings the person came from, so a gap can be traced
  -- back to the page that failed to answer them.
  reader      TEXT,
  -- The stage they say it happened at, from the registry's own vocabulary, or
  -- null when they could not place it.
  stage       TEXT,
  body        TEXT NOT NULL,
  -- Optional and never required: the point is the pattern, not the person.
  contact     TEXT,
  status      TEXT NOT NULL DEFAULT 'new',
  note        TEXT
);

CREATE INDEX IF NOT EXISTS submissions_status ON submissions (status, created_at);
