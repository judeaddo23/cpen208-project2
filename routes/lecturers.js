const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/lecturers — list all lecturers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lecturer_id, first_name, last_name, email, office FROM academic.lecturers ORDER BY lecturer_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lecturers.' });
  }
});

// GET /api/lecturers/:id/courses — courses a lecturer teaches
router.get('/:id/courses', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lc.course_code, c.title, lc.semester
       FROM academic.lecturer_courses lc
       JOIN academic.courses c ON c.course_code = lc.course_code
       WHERE lc.lecturer_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses for this lecturer.' });
  }
});

// POST /api/lecturers/assign-course — Functionality 4: Lecturer to Course Assignment
router.post('/assign-course', async (req, res) => {
  try {
    const { lecturer_id, course_code, semester } = req.body;

    if (!lecturer_id || !course_code || !semester) {
      return res.status(400).json({ error: 'lecturer_id, course_code, and semester are required.' });
    }

    const result = await pool.query(
      `INSERT INTO academic.lecturer_courses (lecturer_id, course_code, semester)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [lecturer_id, course_code, semester]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This lecturer is already assigned to this course for this semester.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to assign lecturer to course.' });
  }
});

// GET /api/lecturers/:id/tas — TAs assigned to a lecturer
router.get('/:id/tas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lt.course_code, lt.semester, s.first_name, s.last_name, s.index_number
       FROM academic.lecturer_tas lt
       JOIN academic.teaching_assistants ta ON ta.ta_id = lt.ta_id
       JOIN academic.students s ON s.student_id = ta.student_id
       WHERE lt.lecturer_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch TAs for this lecturer.' });
  }
});

// POST /api/lecturers/assign-ta — Functionality 5: Lecturer to TA Assignment
router.post('/assign-ta', async (req, res) => {
  try {
    const { lecturer_id, ta_id, course_code, semester } = req.body;

    if (!lecturer_id || !ta_id || !course_code || !semester) {
      return res.status(400).json({ error: 'lecturer_id, ta_id, course_code, and semester are required.' });
    }

    const result = await pool.query(
      `INSERT INTO academic.lecturer_tas (lecturer_id, ta_id, course_code, semester)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [lecturer_id, ta_id, course_code, semester]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This TA is already assigned to this lecturer for this course and semester.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to assign TA to lecturer.' });
  }
});

module.exports = router;