const express = require('express');
const router = express.Router();
const db = require('../db');

// Daily report by date (optional date query)
router.get("/daily", (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  db.all(`
    SELECT s.quantity, s.sale_price, p.purchase_price
    FROM sales s
    JOIN products p ON s.product_id = p.id
    WHERE s.date = ?
  `, [date], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});

    let revenue = 0, profit = 0;
    rows.forEach(r => {
      revenue += r.sale_price * r.quantity;
      profit += (r.sale_price - r.purchase_price) * r.quantity;
    });

    res.json({ date, revenue, profit });
  });
});

// Monthly report
router.get("/monthly", (req, res) => {
  const month = req.query.month; // 1-12
  const year = req.query.year;

  db.all(`
    SELECT s.quantity, s.sale_price, p.purchase_price
    FROM sales s
    JOIN products p ON s.product_id = p.id
    WHERE strftime('%m', s.date) = ? AND strftime('%Y', s.date) = ?
  `, [String(month).padStart(2,'0'), year], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});

    let revenue = 0, profit = 0;
    rows.forEach(r => {
      revenue += r.sale_price * r.quantity;
      profit += (r.sale_price - r.purchase_price) * r.quantity;
    });

    res.json({ month, year, revenue, profit });
  });
});

// Total report
router.get("/total", (req, res) => {
  db.all(`
    SELECT s.quantity, s.sale_price, p.purchase_price
    FROM sales s
    JOIN products p ON s.product_id = p.id
  `, [], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});

    let revenue = 0, profit = 0;
    rows.forEach(r => {
      revenue += r.sale_price * r.quantity;
      profit += (r.sale_price - r.purchase_price) * r.quantity;
    });

    res.json({ revenue, profit });
  });
});

module.exports = router;
