const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all loans
router.get("/", (req, res) => {
  db.all("SELECT * FROM loans", [], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// Add loan
router.post("/", (req, res) => {
  const { type, name, amount, received_by, date } = req.body;
  db.run(
    "INSERT INTO loans (type, name, amount, received_by, date) VALUES (?, ?, ?, ?, ?)",
    [type, name, amount, received_by, date],
    function(err) {
      if(err) return res.status(500).json({error: err.message});
      res.json({ id: this.lastID });
    }
  );
});

// Update loan
router.put("/:id", (req, res) => {
  const { type, name, amount, received_by, date } = req.body;
  const { id } = req.params;
  db.run(
    "UPDATE loans SET type=?, name=?, amount=?, received_by=?, date=? WHERE id=?",
    [type, name, amount, received_by, date, id],
    function(err) {
      if(err) return res.status(500).json({error: err.message});
      res.json({ updated: this.changes });
    }
  );
});

// Delete loan
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM loans WHERE id=?", [id], function(err) {
    if(err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
