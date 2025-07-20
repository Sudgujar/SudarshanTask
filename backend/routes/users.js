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

// Update user (admin only)
router.put('/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, address, role } = req.body;
  const userId = req.params.id;
  
  // Validation
  if (!name || name.length < 4 || name.length > 60) return res.status(400).json({ error: 'Invalid name' });
  if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!address || address.length > 400) return res.status(400).json({ error: 'Invalid address' });
  if (!role || !['user', 'admin', 'owner'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, address = $3, role = $4 WHERE id = $5 RETURNING id, name, email, address, role',
      [name, email, address, role, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const userId = req.params.id;
  
  // Prevent admin from deleting themselves
  if (parseInt(userId) === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
  
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard stats (admin only)
router.get('/stats/dashboard', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const storesCount = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingsCount = await pool.query('SELECT COUNT(*) FROM ratings');
    const recentUsers = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    const topStores = await pool.query(`
      SELECT s.id, s.name, s.email, s.address, AVG(r.rating) as avg_rating, COUNT(r.id) as rating_count 
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      GROUP BY s.id, s.name, s.email, s.address 
      ORDER BY avg_rating DESC NULLS LAST 
      LIMIT 5
    `);
    
    res.json({
      stats: {
        users: parseInt(usersCount.rows[0].count),
        stores: parseInt(storesCount.rows[0].count),
        ratings: parseInt(ratingsCount.rows[0].count)
      },
      recentUsers: recentUsers.rows,
      topStores: topStores.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
