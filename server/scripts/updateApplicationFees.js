const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../models/Course');
const Scholarship = require('../models/Scholarship');

const updateApplicationFees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/study-abroad');
    console.log('Connected to MongoDB');

    // Update courses that don't have applicationFee set
    const coursesWithoutFee = await Course.find({ 
      $or: [
        { applicationFee: { $exists: false } },
        { applicationFee: 0 },
        { applicationFee: null }
      ]
    });

    console.log(`Found ${coursesWithoutFee.length} courses without application fee`);

    for (const course of coursesWithoutFee) {
      // Set a reasonable application fee based on tuition fee (typically 0.5-1% of tuition)
      const applicationFee = Math.max(50, Math.min(300, Math.round(course.tuitionFee * 0.005)));
      
      await Course.findByIdAndUpdate(course._id, { 
        applicationFee: applicationFee 
      });
      
      console.log(`Updated ${course.title}: applicationFee = ${applicationFee} ${course.currency}`);
    }

    // Update scholarships that don't have applicationFee set
    const scholarshipsWithoutFee = await Scholarship.find({ 
      $or: [
        { applicationFee: { $exists: false } },
        { applicationFee: 0 },
        { applicationFee: null }
      ]
    });

    console.log(`Found ${scholarshipsWithoutFee.length} scholarships without application fee`);

    for (const scholarship of scholarshipsWithoutFee) {
      // Set a reasonable application fee for scholarships (typically lower, $25-100)
      const applicationFee = Math.max(25, Math.min(100, Math.round(scholarship.amount * 0.001)));
      
      await Scholarship.findByIdAndUpdate(scholarship._id, { 
        applicationFee: applicationFee 
      });
      
      console.log(`Updated ${scholarship.title}: applicationFee = ${applicationFee} ${scholarship.currency}`);
    }

    console.log('Application fees updated successfully');
    
  } catch (error) {
    console.error('Error updating application fees:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the update
updateApplicationFees();
