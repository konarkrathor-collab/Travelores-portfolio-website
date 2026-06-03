const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

const ADMIN_KEY = process.env.ADMIN_KEY || 'adminkey_demo';

router.get('/', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM destinations ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'] || req.body.adminKey;
    if (!key || key !== ADMIN_KEY) return res.status(403).json({ error: 'Admin key required' });

    const { title, country, description, image } = req.body;
    const result = await run('INSERT INTO destinations (title, country, description, image) VALUES (?, ?, ?, ?)', [
      title,
      country,
      description,
      image
    ]);
    const created = await get('SELECT * FROM destinations WHERE id = ?', [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
