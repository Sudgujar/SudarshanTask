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

// Admin: Add new store
router.post('/', authRequired, async (req, res) => {
  // Admin can add for any owner, owner can add for themselves
  const { name, email, address, owner_id } = req.body;
  let actualOwnerId = owner_id;
  if (req.user.role === 'owner') {
    actualOwnerId = req.user.id;
  } else if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!name || name.length < 1 || name.length > 60) return res.status(400).json({ error: 'Invalid name' });
  if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!address || address.length > 400) return res.status(400).json({ error: 'Invalid address' });
  try {
    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, actualOwnerId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// List stores (all users, with filters)
router.get('/', authRequired, async (req, res) => {
  const { name, address } = req.query;
  let query = `SELECT s.*, COALESCE(avg(r.rating),0) as avg_rating FROM stores s LEFT JOIN ratings r ON s.id = r.store_id WHERE 1=1`;
  const params = [];
  if (name) { query += ' AND s.name ILIKE $' + (params.length + 1); params.push(`%${name}%`); }
  if (address) { query += ' AND s.address ILIKE $' + (params.length + 1); params.push(`%${address}%`); }
  query += ' GROUP BY s.id ORDER BY s.name ASC';
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get store details (all users)
router.get('/:id', authRequired, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stores WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update store (admin only)
router.put('/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, address, owner_id } = req.body;
  const storeId = req.params.id;
  
  // Validation
  if (!name || name.length < 1 || name.length > 60) return res.status(400).json({ error: 'Invalid name' });
  if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!address || address.length > 400) return res.status(400).json({ error: 'Invalid address' });
  
  try {
    const result = await pool.query(
      'UPDATE stores SET name = $1, email = $2, address = $3, owner_id = $4 WHERE id = $5 RETURNING *',
      [name, email, address, owner_id || null, storeId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Store not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete store (admin only)
router.delete('/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const storeId = req.params.id;
  
  try {
    const result = await pool.query('DELETE FROM stores WHERE id = $1 RETURNING id', [storeId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Store not found' });
    res.json({ success: true, message: 'Store deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
