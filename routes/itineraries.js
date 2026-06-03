const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'Missing auth token' });
  const parts = h.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Malformed token' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM itineraries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, days, details } = req.body;
    const result = await run('INSERT INTO itineraries (user_id, title, days, details) VALUES (?, ?, ?, ?)', [
      req.user.id || null,
      title || 'Untitled',
      days || 1,
      details || ''
    ]);
    const created = await get('SELECT * FROM itineraries WHERE id = ?', [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
