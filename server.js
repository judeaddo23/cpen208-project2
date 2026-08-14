require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const feesRoutes = require('./routes/fees');
const studentsRoutes = require('./routes/students');
const coursesRoutes = require('./routes/courses');
const lecturersRoutes = require('./routes/lecturers');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CPEN 208 Project 2 API is running.' });
});

// Any request starting with /api/fees goes to routes/fees.js
app.use('/api/fees', feesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lecturers', lecturersRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});