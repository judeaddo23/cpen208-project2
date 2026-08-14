const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/students — list all students
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT student_id, index_number, first_name, last_name, email, program, level, date_enrolled
       FROM academic.students
       ORDER BY student_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

// GET /api/students/:id — one student by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT student_id, index_number, first_name, last_name, email, program, level, date_enrolled
       FROM academic.students
       WHERE student_id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch student.' });
  }
});

// POST /api/students — create a new student
router.post('/', async (req, res) => {
  try {
    const { index_number, first_name, last_name, email, program, level } = req.body;

    if (!index_number || !first_name || !last_name || !email || !program || !level) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const result = await pool.query(
      `INSERT INTO academic.students (index_number, first_name, last_name, email, program, level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [index_number, first_name, last_name, email, program, level]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A student with this index number or email already exists.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create student.' });
  }
});

module.exports = router;