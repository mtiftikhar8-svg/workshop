// const express = require('express');
// const router = express.Router();
// const db = require('../db');

// // Helper to send DB errors uniformly
// function dbError(res, err) {
//   console.error(err);
//   return res.status(500).json({ error: err.message || "Database error" });
// }

// // GET all products (for bill page)
// router.get('/', (req, res) => {
//   db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
//     if (err) return dbError(res, err);
//     res.json(rows || []);
//   });
// });

// // POST create product
// router.post('/', (req, res) => {
//   const { name, quantity, purchase_price, sale_price } = req.body;
//   if (!name || quantity == null || purchase_price == null || sale_price == null) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }
//   db.run(
//     "INSERT INTO products (name, quantity, purchase_price, sale_price) VALUES (?, ?, ?, ?)",
//     [String(name).trim(), Number(quantity), Number(purchase_price), Number(sale_price)],
//     function(err) {
//       if (err) {
//         if (err.message.includes("UNIQUE")) return res.status(400).json({ error: "Product name exists" });
//         return dbError(res, err);
//       }
//       res.status(201).json({ id: this.lastID });
//     }
//   );
// });

// // PUT update product
// router.put('/:id', (req, res) => {
//   const id = Number(req.params.id);
//   const { name, quantity, purchase_price, sale_price } = req.body;
//   db.run(
//     "UPDATE products SET name=?, quantity=?, purchase_price=?, sale_price=? WHERE id=?",
//     [String(name).trim(), Number(quantity), Number(purchase_price), Number(sale_price), id],
//     function(err) {
//       if (err) return dbError(res, err);
//       if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
//       res.json({ updated: this.changes });
//     }
//   );
// });

// // DELETE product
// router.delete('/:id', (req, res) => {
//   const id = Number(req.params.id);
//   db.run("DELETE FROM products WHERE id=?", [id], function(err) {
//     if (err) return dbError(res, err);
//     if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
//     res.json({ deleted: this.changes });
//   });
// });

// // PUT decrease stock (used by bill page)
// router.put('/:id/decrease', (req, res) => {
//   const id = Number(req.params.id);
//   const { quantity } = req.body;
//   if (!quantity || quantity <= 0) return res.status(400).json({ error: "Invalid quantity" });

//   db.run(
//     "UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?",
//     [quantity, id, quantity],
//     function(err) {
//       if (err) return dbError(res, err);
//       if (this.changes === 0) return res.status(400).json({ error: "Not enough stock" });
//       res.json({ success: true });
//     }
//   );
// });

// // PUT increase stock (used if cart item removed before printing)
// router.put('/:id/increase', (req, res) => {
//   const id = Number(req.params.id);
//   const { quantity } = req.body;
//   if (!quantity || quantity <= 0) return res.status(400).json({ error: "Invalid quantity" });

//   db.run(
//     "UPDATE products SET quantity = quantity + ? WHERE id = ?",
//     [quantity, id],
//     function(err) {
//       if (err) return dbError(res, err);
//       res.json({ success: true });
//     }
//   );
// });

// module.exports = router;







const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to send DB errors uniformly
function dbError(res, err) {
  console.error(err);
  return res.status(500).json({ error: err.message || "Database error" });
}

// GET all products (for bill page)
router.get('/', (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
    if (err) return dbError(res, err);
    res.json(rows || []);
  });
});

// POST create product
router.post('/', (req, res) => {
  const { name, quantity, purchase_price, sale_price } = req.body;
  if (!name || quantity == null || purchase_price == null || sale_price == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  db.run(
    "INSERT INTO products (name, quantity, purchase_price, sale_price) VALUES (?, ?, ?, ?)",
    [String(name).trim(), Number(quantity), Number(purchase_price), Number(sale_price)],
    function(err) {
      if (err) {
        if (err.message.includes("UNIQUE")) return res.status(400).json({ error: "Product name exists" });
        return dbError(res, err);
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// PUT update product
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, quantity, purchase_price, sale_price } = req.body;
  db.run(
    "UPDATE products SET name=?, quantity=?, purchase_price=?, sale_price=? WHERE id=?",
    [String(name).trim(), Number(quantity), Number(purchase_price), Number(sale_price), id],
    function(err) {
      if (err) return dbError(res, err);
      if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
      res.json({ updated: this.changes });
    }
  );
});

// DELETE product
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run("DELETE FROM products WHERE id=?", [id], function(err) {
    if (err) return dbError(res, err);
    if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ deleted: this.changes });
  });
});

// PUT decrease stock (used by bill page)
router.put('/:id/decrease', (req, res) => {
  const id = Number(req.params.id);

  // ✅ Convert quantity to number
  let quantity = Number(req.body.quantity);

  if (!quantity || quantity <= 0) return res.status(400).json({ error: "Invalid quantity" });

  db.run(
    "UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?",
    [quantity, id, quantity],
    function(err) {
      if (err) return dbError(res, err);
      if (this.changes === 0) return res.status(400).json({ error: "Not enough stock" });
      res.json({ success: true });
    }
  );
});

// PUT increase stock (used if cart item removed before printing)
router.put('/:id/increase', (req, res) => {
  const id = Number(req.params.id);

  // ✅ Convert quantity to number
  let quantity = Number(req.body.quantity);

  if (!quantity || quantity <= 0) return res.status(400).json({ error: "Invalid quantity" });

  db.run(
    "UPDATE products SET quantity = quantity + ? WHERE id = ?",
    [quantity, id],
    function(err) {
      if (err) return dbError(res, err);
      res.json({ success: true });
    }
  );
});

module.exports = router;
