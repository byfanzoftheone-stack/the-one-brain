const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

// GET /recipes — all recipes with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, author_id } = req.query;
    let query = `
      SELECT r.*, u.name as author_name, u.profile_photo as author_photo
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (category) { params.push(category); query += ` AND r.category = $${params.length}`; }
    if (author_id) { params.push(author_id); query += ` AND r.author_id = $${params.length}`; }
    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /recipes/:id — single recipe with comments
router.get('/:id', async (req, res) => {
  try {
    const recipeResult = await pool.query(
      `SELECT r.*, u.name as author_name, u.profile_photo as author_photo
       FROM recipes r LEFT JOIN users u ON r.author_id = u.id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!recipeResult.rows[0]) return res.status(404).json({ error: 'Recipe not found' });

    const commentsResult = await pool.query(
      `SELECT c.*, u.name as user_name FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = $1 ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    res.json({ ...recipeResult.rows[0], comments: commentsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// POST /recipes — create recipe
router.post('/', async (req, res) => {
  try {
    const { title, ingredients, steps, category, author_id, story_text, media_urls } = req.body;
    const result = await pool.query(
      `INSERT INTO recipes (title, ingredients, steps, category, author_id, story_text, media_urls)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, ingredients || [], steps || [], category || 'special', author_id, story_text, media_urls || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// POST /recipes/:id/comments — add comment/memory
router.post('/:id/comments', async (req, res) => {
  try {
    const { user_id, comment_text } = req.body;
    const result = await pool.query(
      `INSERT INTO comments (recipe_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, user_id, comment_text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
