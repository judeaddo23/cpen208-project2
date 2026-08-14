const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/fees/outstanding
// Calls the get_outstanding_fees() function built in Project 1
router.get('/outstanding', async (req, res) => {
  try {
    const result = await pool.query('SELECT academic.get_outstanding_fees()');
    const data = result.rows[0].get_outstanding_fees || [];
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch outstanding fees.' });
  }
});

// POST /api/fees/payments
// Records a new fee payment for a student
router.post('/payments', async (req, res) => {
  try {
    const { student_id, amount_paid, semester } = req.body;

    if (!student_id || !amount_paid || !semester) {
      return res.status(400).json({ error: 'student_id, amount_paid, and semester are required.' });
    }

    const result = await pool.query(
      `INSERT INTO academic.fee_payments (student_id, amount_paid, semester)
       VALUES ($1, $2, $3)
       RETURNING payment_id, student_id, amount_paid, payment_date, semester`,
      [student_id, amount_paid, semester]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment.' });
  }
});

module.exports = router;