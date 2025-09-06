const User = require('../models/User');
const Course = require('../models/Course');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const ScholarshipApplication = require('../models/ScholarshipApplication');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    // Get total users
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    // Get total courses
    const totalCourses = await Course.countDocuments();
    
    // Get total bookmarks
    const totalBookmarks = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $size: "$bookmarkedCourses" } }
        }
      }
    ]);
    
    // Get active users in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: twentyFourHoursAgo }
    });

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Get new users this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Get new users this month
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: monthAgo }
    });

    // Application stats (courses + scholarships)
    const [courseCounts, scholarshipCounts] = await Promise.all([
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ScholarshipApplication.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);
    const countByStatus = (arr, status) => arr.find(x => x._id === status)?.count || 0;
    const totalApplications = courseCounts.reduce((a,c)=>a+c.count,0) + scholarshipCounts.reduce((a,c)=>a+c.count,0);
    const pendingApplications = countByStatus(courseCounts,'pending') + countByStatus(scholarshipCounts,'pending');
    const approvedApplications = countByStatus(courseCounts,'approved') + countByStatus(scholarshipCounts,'approved');

    const statsData = {
      totalUsers,
      totalCourses,
      totalBookmarks: totalBookmarks[0]?.total || 0,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalApplications,
      pendingApplications,
      approvedApplications
    };
    
    console.log('Stats data:', statsData);
    
    res.json({
      success: true,
      data: statsData
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clean up references (e.g., bookmarks)
    await Course.updateMany(
      { bookmarkedBy: user._id },
      { $pull: { bookmarkedBy: user._id } }
    );

    // Delete the user using a supported method in Mongoose 7+
    await User.deleteOne({ _id: user._id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, university, nationality, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (university !== undefined) user.university = university;
    if (nationality !== undefined) user.nationality = nationality;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    const updatedUser = await user.save();
    
    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete the course using a supported method in Mongoose 7+
    await Course.deleteOne({ _id: course._id });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
};

// @desc    Create a new course
// @route   POST /api/admin/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    
    const course = await Course.create(courseData);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating course'
    });
  }
};

// @desc    Update a course
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const courseData = req.body;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      courseData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating course'
    });
  }
};

// @desc    Get all scholarships
// @route   GET /api/admin/scholarships
// @access  Private/Admin
const getScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find();
    res.json({
      success: true,
      data: scholarships
    });
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scholarships'
    });
  }
};

// @desc    Create a new scholarship
// @route   POST /api/admin/scholarships
// @access  Private/Admin
const createScholarship = async (req, res) => {
  try {
    const scholarshipData = req.body;
    
    const scholarship = await Scholarship.create(scholarshipData);
    
    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      data: scholarship
    });
  } catch (error) {
    console.error('Create scholarship error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors || {}).reduce((acc, key) => {
        acc[key] = error.errors[key]?.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating scholarship'
    });
  }
};

// @desc    Update a scholarship
// @route   PUT /api/admin/scholarships/:id
// @access  Private/Admin
const updateScholarship = async (req, res) => {
  try {
    const scholarshipId = req.params.id;
    const scholarshipData = req.body;
    
    const scholarship = await Scholarship.findById(scholarshipId);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    const updatedScholarship = await Scholarship.findByIdAndUpdate(
      scholarshipId,
      scholarshipData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Scholarship updated successfully',
      data: updatedScholarship
    });
  } catch (error) {
    console.error('Update scholarship error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors || {}).reduce((acc, key) => {
        acc[key] = error.errors[key]?.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating scholarship'
    });
  }
};

// @desc    Delete a scholarship
// @route   DELETE /api/admin/scholarships/:id
// @access  Private/Admin
const deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    await Scholarship.deleteOne({ _id: scholarship._id });

    res.json({
      success: true,
      message: 'Scholarship deleted successfully'
    });
  } catch (error) {
    console.error('Delete scholarship error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting scholarship'
    });
  }
};

// @desc    Get all applications (courses + scholarships)
// @route   GET /api/admin/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
  try {
    const [courseApps, scholarshipApps] = await Promise.all([
      Application.find({ status: { $ne: 'draft' } })
        .populate('user', 'name email')
        .populate('course', 'title university country level')
        .lean(),
      ScholarshipApplication.find({ status: { $ne: 'draft' } })
        .populate('user', 'name email')
        .populate('scholarship', 'title university country')
        .lean()
    ]);

    // Normalize so frontend can reuse the same fields (course, user, status, createdAt)
    const normalized = [
      ...courseApps.map(a => ({ ...a, type: 'course' })),
      ...scholarshipApps.map(a => ({
        ...a,
        type: 'scholarship',
        // Map scholarship fields into course-like field for UI compatibility
        course: {
          title: a.scholarship?.title,
          university: a.scholarship?.university,
          country: a.scholarship?.country
        }
      }))
    ].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

    res.json({ success: true, data: normalized });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, message: 'Error fetching applications' });
  }
};

// @desc    Update application status/adminNotes (supports course or scholarship applications)
// @route   PUT /api/admin/applications/:id
// @access  Private/Admin
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Try course application first
    let app = await Application.findById(id);
    let model = 'course';
    if (!app) {
      app = await ScholarshipApplication.findById(id);
      model = 'scholarship';
    }
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (status) app.status = status;
    if (adminNotes !== undefined) app.adminNotes = adminNotes;
    await app.save();

    res.json({ success: true, message: 'Application updated', data: { id: app._id, model, status: app.status, adminNotes: app.adminNotes } });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ success: false, message: 'Error updating application' });
  }
};

module.exports = {
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
};
