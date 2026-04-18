require('dotenv').config();
const { pool } = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        profile_photo TEXT,
        family_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        ingredients TEXT[] NOT NULL DEFAULT '{}',
        steps TEXT[] NOT NULL DEFAULT '{}',
        category VARCHAR(100) NOT NULL DEFAULT 'special',
        author_id INT REFERENCES users(id),
        story_text TEXT,
        media_urls TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id),
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS memory_wall (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        media_urls TEXT[] DEFAULT '{}',
        memory_text TEXT,
        uploaded_by INT REFERENCES users(id),
        is_interview BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Database migrated successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
