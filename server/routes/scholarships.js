const express = require('express');
const { getScholarships, getScholarshipById } = require('../controllers/scholarshipController');

const router = express.Router();

// Public scholarships list
router.get('/', getScholarships);
router.get('/:id', getScholarshipById);

module.exports = router;
