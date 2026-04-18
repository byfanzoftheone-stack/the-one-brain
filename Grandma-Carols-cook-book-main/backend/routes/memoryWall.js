const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

// GET /memory-wall — all memories (interview first)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.name as uploader_name FROM memory_wall m
       LEFT JOIN users u ON m.uploaded_by = u.id
       ORDER BY m.is_interview DESC, m.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// POST /memory-wall — add memory
router.post('/', async (req, res) => {
  try {
    const { title, media_urls, memory_text, uploaded_by, is_interview } = req.body;
    const result = await pool.query(
      `INSERT INTO memory_wall (title, media_urls, memory_text, uploaded_by, is_interview)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, media_urls || [], memory_text, uploaded_by, is_interview || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add memory' });
  }
});

module.exports = router;
