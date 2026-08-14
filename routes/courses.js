const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/courses — list all courses
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT course_code, title, credits FROM academic.courses ORDER BY course_code`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// GET /api/courses/:code/students — everyone enrolled in a course
router.get('/:code/students', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.student_id, s.index_number, s.first_name, s.last_name, e.semester, e.grade
       FROM academic.enrollments e
       JOIN academic.students s ON s.student_id = e.student_id
       WHERE e.course_code = $1
       ORDER BY s.last_name`,
      [req.params.code]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch enrollments for this course.' });
  }
});

// POST /api/courses/enroll — enroll a student in a course
router.post('/enroll', async (req, res) => {
  try {
    const { student_id, course_code, semester } = req.body;

    if (!student_id || !course_code || !semester) {
      return res.status(400).json({ error: 'student_id, course_code, and semester are required.' });
    }

    const result = await pool.query(
      `INSERT INTO academic.enrollments (student_id, course_code, semester)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [student_id, course_code, semester]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This student is already enrolled in this course for this semester.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to enroll student.' });
  }
});

module.exports = router;