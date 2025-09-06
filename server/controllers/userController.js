const User = require('../models/User');
const Course = require('../models/Course');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const ScholarshipApplication = require('../models/ScholarshipApplication');
const { clearTokenCookies } = require('../middleware/auth');

// @desc    Get user dashboard
// @route   GET /api/user/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarkedCourses')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        dashboardStats: {
          totalBookmarks: user.bookmarkedCourses.length,
          memberSince: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Apply for a scholarship (upsert draft, convert draft to pending on submit)
// @route   POST /api/user/apply-scholarship/:scholarshipId
// @access  Private
const applyScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const userId = req.user.id;
    const applicationData = req.body;

    // Check if scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }

    // Look for an existing application for this user+scholarship
    let existing = await ScholarshipApplication.findOne({ user: userId, scholarship: scholarshipId });

    if (existing) {
      // If a non-draft already exists, block duplicates
      if (existing.status !== 'draft') {
        return res.status(400).json({ success: false, message: 'You have already applied for this scholarship' });
      }
      // Update existing draft
      existing.set({ ...applicationData });
      existing.status = applicationData?.status === 'draft' ? 'draft' : 'pending';
      await existing.save();
      return res.json({
        success: true,
        message: existing.status === 'draft' ? 'Draft saved' : 'Application submitted successfully',
        application: existing
      });
    }

    // Create new application (draft or pending)
    const application = await ScholarshipApplication.create({
      user: userId,
      scholarship: scholarshipId,
      ...applicationData,
      status: applicationData?.status === 'draft' ? 'draft' : 'pending'
    });

    res.status(201).json({ success: true, message: 'Application submitted successfully', application: application });
  } catch (error) {
    console.error('Apply scholarship error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bookmark a scholarship
// @route   POST /api/user/bookmark-scholarship/:scholarshipId
// @access  Private
const bookmarkScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const userId = req.user.id;

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedScholarships.includes(scholarshipId);

    if (isBookmarked) {
      // Remove bookmark
      await User.findByIdAndUpdate(userId, { $pull: { bookmarkedScholarships: scholarshipId } });
      await Scholarship.findByIdAndUpdate(scholarshipId, { $pull: { bookmarkedBy: userId } });
      return res.json({ success: true, message: 'Scholarship removed from bookmarks', bookmarked: false });
    } else {
      // Add bookmark
      await User.findByIdAndUpdate(userId, { $addToSet: { bookmarkedScholarships: scholarshipId } });
      await Scholarship.findByIdAndUpdate(scholarshipId, { $addToSet: { bookmarkedBy: userId } });
      return res.json({ success: true, message: 'Scholarship bookmarked successfully', bookmarked: true });
    }
  } catch (error) {
    console.error('Bookmark scholarship error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove scholarship bookmark
// @route   DELETE /api/user/bookmark-scholarship/:scholarshipId
// @access  Private
const removeScholarshipBookmark = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const userId = req.user.id;

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }

    await User.findByIdAndUpdate(userId, { $pull: { bookmarkedScholarships: scholarshipId } });
    await Scholarship.findByIdAndUpdate(scholarshipId, { $pull: { bookmarkedBy: userId } });

    res.json({ success: true, message: 'Scholarship removed from bookmarks' });
  } catch (error) {
    console.error('Remove scholarship bookmark error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bookmark a course
// @route   POST /api/user/bookmark/:courseId
// @access  Private
const bookmarkCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is already bookmarked
    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedCourses.includes(courseId);

    if (isBookmarked) {
      // Remove bookmark
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarkedCourses: courseId }
      });

      await Course.findByIdAndUpdate(courseId, {
        $pull: { bookmarkedBy: userId }
      });

      res.json({
        success: true,
        message: 'Course removed from bookmarks',
        bookmarked: false
      });
    } else {
      // Add bookmark
      await User.findByIdAndUpdate(userId, {
        $addToSet: { bookmarkedCourses: courseId }
      });

      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { bookmarkedBy: userId }
      });

      res.json({
        success: true,
        message: 'Course bookmarked successfully',
        bookmarked: true
      });
    }
  } catch (error) {
    console.error('Bookmark course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's bookmarks (courses and scholarships)
// @route   GET /api/user/bookmarks
// @access  Private
const getBookmarkedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarkedCourses',
        select: 'title description university country city level field duration tuitionFee currency image applicationDeadline'
      })
      .populate({
        path: 'bookmarkedScholarships',
        select: 'title shortDescription university country amount currency image applicationDeadline'
      })
      .select('bookmarkedCourses bookmarkedScholarships');

    res.json({
      success: true,
      data: {
        bookmarkedCourses: user.bookmarkedCourses || [],
        bookmarkedScholarships: user.bookmarkedScholarships || []
      }
    });
  } catch (error) {
    console.error('Get bookmarked courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map profileImage to profilePicture for frontend compatibility
    const userData = user.toObject();
    userData.profilePicture = userData.profileImage;
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, nationality, university, profilePicture } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (nationality) updateData.nationality = nationality;
    if (university) updateData.university = university;
    // Allow clearing image when sending an empty string: only check for undefined
    if (typeof profilePicture !== 'undefined') updateData.profileImage = profilePicture;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map profileImage to profilePicture for frontend compatibility
    const userData = user.toObject();
    userData.profilePicture = userData.profileImage;

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check if course is bookmarked
// @route   GET /api/user/bookmark-status/:courseId
// @access  Private
const getBookmarkStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedCourses.includes(courseId);

    res.json({
      success: true,
      data: {
        bookmarked: isBookmarked
      }
    });
  } catch (error) {
    console.error('Get bookmark status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove bookmark for current user
// @route   DELETE /api/user/bookmark/:courseId
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { bookmarkedCourses: courseId }
    });

    await Course.findByIdAndUpdate(courseId, {
      $pull: { bookmarkedBy: userId }
    });

    res.json({
      success: true,
      message: 'Course removed from bookmarks'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete current user's account
// @route   DELETE /api/user/profile
// @access  Private
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clean up references where this user is referenced
    await Course.updateMany(
      { bookmarkedBy: user._id },
      { $pull: { bookmarkedBy: user._id } }
    );

    // Delete user document
    await User.deleteOne({ _id: user._id });

    // Clear auth cookies
    clearTokenCookies(res);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Apply for a course (upsert draft, convert draft to pending on submit)
// @route   POST /api/user/apply/:courseId
// @access  Private
const applyCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const applicationData = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Look for an existing application for this user+course
    let existing = await Application.findOne({ user: userId, course: courseId });
    if (existing) {
      // If a non-draft already exists, block duplicates
      if (existing.status !== 'draft') {
        return res.status(400).json({ success: false, message: 'You have already applied for this course' });
      }
      // Update existing draft
      existing.set({ ...applicationData });
      existing.status = applicationData?.status === 'draft' ? 'draft' : 'pending';
      await existing.save();
      await existing.populate('course', 'title university');
      return res.json({
        success: true,
        message: existing.status === 'draft' ? 'Draft saved' : 'Application submitted successfully',
        application: existing
      });
    }

    // Create new application (draft or pending)
    const application = await Application.create({
      user: userId,
      course: courseId,
      ...applicationData,
      status: applicationData?.status === 'draft' ? 'draft' : 'pending'
    });
    await application.populate('course', 'title university');

    res.status(201).json({ success: true, message: 'Application submitted successfully', application: application });
  } catch (error) {
    console.error('Apply course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's applications (courses and scholarships) including drafts
// @route   GET /api/user/applications
// @access  Private
const getUserApplications = async (req, res) => {
  try {
    const [courseApps, scholarshipApps] = await Promise.all([
      Application.find({ user: req.user.id })
        .populate('course', 'title university country image applicationDeadline')
        .sort({ createdAt: -1 }),
      ScholarshipApplication.find({ user: req.user.id })
        .populate('scholarship', 'title university country image applicationDeadline')
        .sort({ createdAt: -1 })
    ]);

    const normalize = (app) => ({
      _id: app._id,
      type: app.course ? 'course' : 'scholarship',
      course: app.course, // for course applications
      scholarship: app.scholarship, // for scholarship applications
      status: app.status,
      createdAt: app.createdAt,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      phone: app.phone,
      education: app.education,
      gpa: app.gpa
    });

    const all = [...courseApps, ...scholarshipApps].map(normalize).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    const applications = all.filter(a => a.status !== 'draft');
    const drafts = all.filter(a => a.status === 'draft');

    res.json({
      success: true,
      data: { applications, drafts }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit a saved draft application (course or scholarship)
// @route   PUT /api/user/application-draft/:type/:id/submit
// @access  Private
const submitDraftApplication = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'course' ? Application : ScholarshipApplication;
    const app = await Model.findOne({ _id: id, user: req.user.id });
    if (!app) return res.status(404).json({ success: false, message: 'Draft not found' });
    if (app.status !== 'draft') return res.status(400).json({ success: false, message: 'Not a draft' });
    app.status = 'pending';
    await app.save();
    res.json({ success: true, message: 'Draft submitted' });
  } catch (error) {
    console.error('Submit draft error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a saved draft application (course or scholarship)
// @route   DELETE /api/user/application-draft/:type/:id
// @access  Private
const deleteDraftApplication = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'course' ? Application : ScholarshipApplication;
    const app = await Model.findOne({ _id: id, user: req.user.id });
    if (!app) return res.status(404).json({ success: false, message: 'Draft not found' });
    if (app.status !== 'draft') return res.status(400).json({ success: false, message: 'Cannot delete non-draft application' });
    await Model.deleteOne({ _id: id });
    res.json({ success: true, message: 'Draft deleted' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
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
};