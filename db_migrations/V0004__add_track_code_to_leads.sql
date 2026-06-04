ALTER TABLE leads ADD COLUMN IF NOT EXISTS track_code TEXT;

UPDATE leads SET track_code = upper(substring(md5(random()::text || id::text) for 6)) WHERE track_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS leads_track_code_idx ON leads(track_code);