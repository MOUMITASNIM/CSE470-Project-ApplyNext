const express = require('express');
const verifyAdmin = require('../middleware/verifyAdmin');
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getApplications,
  updateApplication
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes are protected
router.use(verifyAdmin);

// Admin dashboard routes
router.get('/stats', getStats);

// User management routes
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Course management routes
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Scholarship management routes
router.get('/scholarships', getScholarships);
router.post('/scholarships', createScholarship);
router.put('/scholarships/:id', updateScholarship);
router.delete('/scholarships/:id', deleteScholarship);

// Application management routes
router.get('/applications', getApplications);
router.put('/applications/:id', updateApplication);

module.exports = router;