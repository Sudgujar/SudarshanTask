const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to check JWT and role
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

// Get all users (admin only, with filters)
router.get('/', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, address, role } = req.query;
  let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
  const params = [];
  if (name) { query += ' AND name ILIKE $' + (params.length + 1); params.push(`%${name}%`); }
  if (email) { query += ' AND email ILIKE $' + (params.length + 1); params.push(`%${email}%`); }
  if (address) { query += ' AND address ILIKE $' + (params.length + 1); params.push(`%${address}%`); }
  if (role) { query += ' AND role = $' + (params.length + 1); params.push(role); }
  query += ' ORDER BY name ASC';
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user details (admin only)
router.get('/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query('SELECT id, name, email, address, role FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update password (self only)
router.put('/password', authRequired, async (req, res) => {
  const { password } = req.body;
  if (!password || !/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(password)) return res.status(400).json({ error: 'Invalid password' });
  try {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
