const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all withdraws
router.get("/", (req, res) => {
  db.all("SELECT * FROM withdraws", [], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// Add withdraw
router.post("/", (req, res) => {
  const { name, amount, date } = req.body;
  db.run(
    "INSERT INTO withdraws (name, amount, date) VALUES (?, ?, ?)",
    [name, amount, date],
    function(err) {
      if(err) return res.status(500).json({error: err.message});
      res.json({ id: this.lastID });
    }
  );
});

// Update withdraw
router.put("/:id", (req, res) => {
  const { name, amount, date } = req.body;
  const { id } = req.params;
  db.run(
    "UPDATE withdraws SET name=?, amount=?, date=? WHERE id=?",
    [name, amount, date, id],
    function(err) {
      if(err) return res.status(500).json({error: err.message});
      res.json({ updated: this.changes });
    }
  );
});

// Delete withdraw
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM withdraws WHERE id=?", [id], function(err) {
    if(err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
