const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all sales
router.get('/', (req, res) => {
  db.all("SELECT * FROM sales ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// POST sale (record sale)
router.post('/', (req, res) => {
  const { product_id, quantity, sale_price, date } = req.body;
  if (!product_id || !quantity || !sale_price || !date)
    return res.status(400).json({ error: "Missing fields" });

  db.run(
    "INSERT INTO sales (product_id, quantity, sale_price, date) VALUES (?, ?, ?, ?)",
    [product_id, quantity, sale_price, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

module.exports = router;
