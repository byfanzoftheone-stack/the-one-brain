const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

// POST /users — register/login family member
router.post('/', async (req, res) => {
  try {
    const { name, family_code, profile_photo } = req.body;
    // Simple family code auth — all family members share the same code
    if (family_code !== process.env.FAMILY_CODE) {
      return res.status(401).json({ error: 'Invalid family code' });
    }
    // Check if user exists by name
    let result = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
    if (result.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO users (name, family_code, profile_photo) VALUES ($1, $2, $3) RETURNING *',
        [name, family_code, profile_photo || null]
      );
    }
    req.session.userId = result.rows[0].id;
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// GET /users/:id — profile
router.get('/:id', async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!user.rows[0]) return res.status(404).json({ error: 'User not found' });
    const recipes = await pool.query('SELECT * FROM recipes WHERE author_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json({ ...user.rows[0], recipes: recipes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
