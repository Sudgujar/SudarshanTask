const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Submit or update rating (normal user)
router.post('/:store_id', authRequired, async (req, res) => {
  if (req.user.role !== 'user') return res.status(403).json({ error: 'Forbidden' });
  const { rating } = req.body;
  const store_id = req.params.store_id;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating' });
  try {
    // Upsert rating
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id) DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [req.user.id, store_id, rating]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ratings for a store (store owner)
router.get('/store/:store_id', authRequired, async (req, res) => {
  // Only owner of the store can view
  const store_id = req.params.store_id;
  try {
    const store = await pool.query('SELECT * FROM stores WHERE id = $1', [store_id]);
    if (!store.rows[0] || store.rows[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const result = await pool.query('SELECT r.*, u.name, u.email FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = $1', [store_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all ratings (admin)
router.get('/all', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query('SELECT r.*, u.name as user_name, u.email as user_email, s.name as store_name FROM ratings r JOIN users u ON r.user_id = u.id JOIN stores s ON r.store_id = s.id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
