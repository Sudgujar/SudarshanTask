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

// Store owner: Add product to their store
router.post('/', authRequired, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
  const { name, description, price, store_id } = req.body;
  if (!name || name.length < 1 || name.length > 60) return res.status(400).json({ error: 'Invalid product name' });
  if (description && description.length > 400) return res.status(400).json({ error: 'Description too long' });
  if (!price || isNaN(price) || Number(price) <= 0) return res.status(400).json({ error: 'Invalid price' });
  // Check store ownership
  const store = await pool.query('SELECT * FROM stores WHERE id = $1', [store_id]);
  if (!store.rows[0] || store.rows[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, store_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, store_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List products for a store
router.get('/store/:store_id', authRequired, async (req, res) => {
  const store_id = req.params.store_id;
  try {
    const result = await pool.query('SELECT * FROM products WHERE store_id = $1', [store_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
