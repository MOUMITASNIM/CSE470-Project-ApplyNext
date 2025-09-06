const Scholarship = require('../models/Scholarship');

// @desc    Get scholarships (public)
// @route   GET /api/scholarships
// @access  Public
const getScholarships = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit, 10) || 9));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const country = (req.query.country || '').trim();
    const university = (req.query.university || '').trim();

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }
    if (country) query.country = { $regex: country, $options: 'i' };
    if (university) query.university = { $regex: university, $options: 'i' };

    const [items, total] = await Promise.all([
      Scholarship.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title shortDescription university country amount currency image applicationDeadline isActive createdAt'),
      Scholarship.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        scholarships: items,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get scholarship by ID (public)
// @route   GET /api/scholarships/:id
// @access  Public
const getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const scholarship = await Scholarship.findById(id);
    if (!scholarship || scholarship.isActive === false) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }
    res.json({ 
      success: true, 
      data: scholarship
    });
  } catch (error) {
    console.error('Get scholarship by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getScholarships, getScholarshipById };
