// const express = require('express');
// const router = express.Router();
// const db = require('../db');

// // GET all sales
// router.get('/', (req, res) => {
//   db.all("SELECT * FROM sales ORDER BY id DESC", [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows || []);
//   });
// });

// // POST sale (record sale)
// router.post('/', (req, res) => {
//   const { product_id, quantity, sale_price, date } = req.body;
//   if (!product_id || !quantity || !sale_price || !date)
//     return res.status(400).json({ error: "Missing fields" });

//   db.run(
//     "INSERT INTO sales (product_id, quantity, sale_price, date) VALUES (?, ?, ?, ?)",
//     [product_id, quantity, sale_price, date],
//     function(err) {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ success: true, id: this.lastID });
//     }
//   );
// });
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

// GET today's revenue & profit
router.get('/today', (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  db.get(
    "SELECT SUM(revenue) AS revenue, SUM(profit) AS profit FROM sales WHERE date = ?",
    [today],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || { revenue: 0, profit: 0 });
    }
  );
});

// GET revenue & profit by month/year
router.get('/monthly', (req, res) => {
  const { month, year } = req.query;
  db.get(
    `SELECT SUM(revenue) AS revenue, SUM(profit) AS profit 
     FROM sales WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?`,
    [month.padStart(2, '0'), year],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || { revenue: 0, profit: 0 });
    }
  );
});

// POST sale (record sale with revenue & profit)
router.post('/', (req, res) => {
  const { product_id, quantity, sale_price, date } = req.body;
  if (!product_id || !quantity || !sale_price || !date)
    return res.status(400).json({ error: "Missing fields" });

  // ✅ correct column: purchase_price
  db.get("SELECT purchase_price FROM products WHERE id = ?", [product_id], (err, product) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const revenue = quantity * sale_price;
    const profit = quantity * (sale_price - product.purchase_price);

    db.run(
      "INSERT INTO sales (product_id, quantity, sale_price, date, revenue, profit) VALUES (?, ?, ?, ?, ?, ?)",
      [product_id, quantity, sale_price, date, revenue, profit],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID, revenue, profit });
      }
    );
  });
});

module.exports = router;
