import { pool } from "./db.js";

export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      uid TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      skill TEXT NOT NULL DEFAULT 'Beginner',
      lat DOUBLE PRECISION,
      lon DOUBLE PRECISION,
      status TEXT NOT NULL DEFAULT 'offline',
      role TEXT NOT NULL DEFAULT 'user',
      online_wins INTEGER NOT NULL DEFAULT 0,
      online_losses INTEGER NOT NULL DEFAULT 0,
      real_life_wins INTEGER NOT NULL DEFAULT 0,
      real_life_losses INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      game_type TEXT NOT NULL,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER NOT NULL,
      winner_id INTEGER,
      state TEXT NOT NULL DEFAULT 'waiting',
      location TEXT,
      board JSONB,
      current_turn INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      game_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pings (
      id SERIAL PRIMARY KEY,
      to_player_id INTEGER NOT NULL,
      sound TEXT NOT NULL DEFAULT 'default',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'digital',
      venue_name TEXT,
      state TEXT NOT NULL DEFAULT 'active',
      bracket JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tournament_matches (
      id SERIAL PRIMARY KEY,
      tournament_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      match_index INTEGER NOT NULL,
      player1_id INTEGER,
      player2_id INTEGER,
      winner_player_id INTEGER,
      table_number INTEGER,
      state TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS merchandise (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price TEXT NOT NULL DEFAULT 'TBD',
      image_data TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS flyers (
      id SERIAL PRIMARY KEY,
      image_data TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Add role column if upgrading existing DB
  await pool.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';`);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_games_p1 ON games(player1_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_games_p2 ON games(player2_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_game ON chat_messages(game_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pings_player ON pings(to_player_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tm_tournament ON tournament_matches(tournament_id);`);
}
