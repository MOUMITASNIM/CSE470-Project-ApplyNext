const express = require('express');
const { protectUser } = require('../middleware/auth');
const {
  getUserDashboard,
  bookmarkCourse,
  getBookmarkedCourses,
  getProfile,
  updateProfile,
  getBookmarkStatus,
  removeBookmark,
  deleteProfile,
  applyCourse,
  getUserApplications,
  bookmarkScholarship,
  removeScholarshipBookmark,
  applyScholarship,
  submitDraftApplication,
  deleteDraftApplication
} = require('../controllers/userController');

const router = express.Router();

// All routes are protected
router.use(protectUser);

// Dashboard routes
router.get('/dashboard', getUserDashboard);
router.get('/bookmarks', getBookmarkedCourses);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);

// Course bookmarking routes
router.post('/bookmark/:courseId', bookmarkCourse);
router.get('/bookmark-status/:courseId', getBookmarkStatus);
router.delete('/bookmark/:courseId', removeBookmark);

// Scholarship bookmarking routes
router.post('/bookmark-scholarship/:scholarshipId', bookmarkScholarship);
router.delete('/bookmark-scholarship/:scholarshipId', removeScholarshipBookmark);

// Application routes
router.post('/apply/:courseId', applyCourse);
router.post('/apply-scholarship/:scholarshipId', applyScholarship);
router.get('/applications', getUserApplications);
router.put('/application-draft/:type/:id/submit', submitDraftApplication);
router.delete('/application-draft/:type/:id', deleteDraftApplication);

module.exports = router;