const express = require("express");
const router = express.Router();
const db = require("../db");

// ================= DAILY REPORT =================
router.get("/daily", (req, res) => {
  let date = req.query.date;

  // Agar date pass na ho to aaj ka date use kare
  if (!date) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    date = `${yyyy}-${mm}-${dd}`;
  }

  db.all(`
    SELECT s.quantity, s.sale_price, p.purchase_price
    FROM sales s
    JOIN products p ON s.product_id = p.id
    WHERE s.date = ?
  `, [date], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    let revenue = 0, profit = 0;
    rows.forEach(r => {
      revenue += r.sale_price * r.quantity;
      profit += (r.sale_price - r.purchase_price) * r.quantity;
    });

    res.json({ date, revenue, profit });
  });
});

// ================= MONTHLY REPORT =================
router.get("/monthly", (req, res) => {
  const month = String(req.query.month).padStart(2, "0"); // 01-12
  const year = req.query.year;

  db.all(`
    SELECT s.quantity, s.sale_price, p.purchase_price
    FROM sales s
    JOIN products p ON s.product_id = p.id
    WHERE s.date LIKE ?
  `, [`${year}-${month}-%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    let revenue = 0, profit = 0;
    rows.forEach(r => {
      revenue += r.sale_price * r.quantity;
      profit += (r.sale_price - r.purchase_price) * r.quantity;
    });

    // ✅ Sirf ek hi row return karega (total month)
    res.json([
      { date: `${year}-${month}`, revenue, profit }
    ]);
  });
});

// ================= TOTAL REPORT =================
router.get("/total", (req, res) => {
  db.all(`
    SELECT s.quantity, s.sale_price, p.purchase_price
    FROM sales s
    JOIN products p ON s.product_id = p.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    let revenue = 0, profit = 0;
    rows.forEach(r => {
      revenue += r.sale_price * r.quantity;
      profit += (r.sale_price - r.purchase_price) * r.quantity;
    });

    res.json({ revenue, profit });
  });
});

module.exports = router;

