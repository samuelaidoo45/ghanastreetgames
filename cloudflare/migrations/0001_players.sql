CREATE TABLE players(id TEXT PRIMARY KEY, name TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL);
CREATE TABLE runs(id TEXT PRIMARY KEY, player_id TEXT NOT NULL REFERENCES players(id), game TEXT NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER, score INTEGER, won INTEGER, room TEXT);
CREATE INDEX runs_player_time ON runs(player_id,started_at);
CREATE TABLE awards(id TEXT NOT NULL, player_id TEXT NOT NULL REFERENCES players(id), game TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('practice','friend')), points INTEGER NOT NULL CHECK(points BETWEEN 0 AND 100), won INTEGER NOT NULL, score INTEGER NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(id,player_id));
CREATE INDEX awards_player ON awards(player_id,created_at);
CREATE INDEX awards_league ON awards(kind,game,player_id);
CREATE TABLE rate_limits(key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);
