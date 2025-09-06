import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ApplicationForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    education: 'High School',
    currentUniversity: '',
    gpa: '',
    coverLetter: ''
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses/${courseId}`);
        setCourse(response.data.data);
        
        // Pre-fill email from user profile
        try {
          const userResponse = await axios.get('/api/user/profile');
          if (userResponse.data.success) {
            setFormData(prev => ({
              ...prev,
              email: userResponse.data.data.email || '',
              firstName: userResponse.data.data.name?.split(' ')[0] || '',
              lastName: userResponse.data.data.name?.split(' ').slice(1).join(' ') || ''
            }));
          }
        } catch (userError) {
          console.log('Could not fetch user profile');
        }

        // Try to load an existing draft for this course
        try {
          const apps = await axios.get('/api/user/applications');
          const drafts = apps.data?.data?.drafts || [];
          const draft = drafts.find(d => d.type === 'course' && d.course?._id === courseId);
          if (draft) {
            setFormData(prev => ({
              ...prev,
              firstName: draft.firstName || prev.firstName,
              lastName: draft.lastName || prev.lastName,
              email: draft.email || prev.email,
              phone: draft.phone || prev.phone,
              education: draft.education || prev.education,
              gpa: draft.gpa || prev.gpa,
            }));
            toast.success('Loaded saved draft');
          }
        } catch (e) {}
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'nationality', 'education', 'gpa'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in all required fields`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    
    // GPA validation
    const gpa = parseFloat(formData.gpa);
    if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
      toast.error('Please enter a valid GPA between 0 and 4.0');
      return false;
    }
    
    // Check course requirements
    if (course.requirements && course.requirements.length > 0) {
      // This is a simplified check. In a real application, you would have more
      // sophisticated logic to check if the applicant meets the requirements
      if (gpa < 3.0) {
        toast.error('Your GPA does not meet the minimum requirement for this course');
        return false;
      }
    }
    
    return true;
  };

  const submit = async (status) => {
    if (status !== 'draft' && !validateForm()) return;
    try {
      setSubmitting(true);
      const response = await axios.post(`/api/user/apply/${courseId}`, { ...formData, status });
      if (response.data.success) {
        if (status === 'draft') {
          toast.success('Draft saved');
          navigate(`/courses/${courseId}`);
        } else {
          setShowSuccessModal(true);
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to apply for courses');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit application. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Application Submitted!</h3>
          <p className="text-sm text-gray-500 mb-6">
            Your application for {course?.title} has been successfully submitted. You can track its status in your profile dashboard.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
            >
              Go to Profile
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
            >
              Browse More Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-500"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Course not found'}
        </div>
        <div className="mt-4">
          <Link to="/courses" className="inline-flex items-center text-secondary-600 hover:text-secondary-800">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link to={`/courses/${courseId}`} className="inline-flex items-center text-secondary-600 hover:text-secondary-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Course Details
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Apply for {course.title}</h1>
          <p className="text-gray-600 mt-1">{course.university}, {course.country}</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); submit('pending'); }} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. +1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
            </div>
          </div>
          
          {/* Academic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">Highest Education Level *</label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="High School">High School</option>
                  <option value="Associate's Degree">Associate's Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="currentUniversity" className="block text-sm font-medium text-gray-700 mb-1">Current/Previous University</label>
                <input
                  type="text"
                  id="currentUniversity"
                  name="currentUniversity"
                  value={formData.currentUniversity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div>
                <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-1">GPA (out of 4.0) *</label>
                <input
                  type="number"
                  id="gpa"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  required
                  min="0"
                  max="4"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
            </div>
          </div>
          
          {/* Cover Letter */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h2>
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">Why are you interested in this course?</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                placeholder="Tell us why you're interested in this course and how it aligns with your academic and career goals..."
              ></textarea>
            </div>
          </div>
          
          {/* Course Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Course Requirements</h2>
              <p className="text-sm text-gray-600 mb-3">Please ensure you meet the following requirements before applying:</p>
              <ul className="space-y-2">
                {course.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Submit Buttons */}
          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <Link
                to={`/courses/${courseId}`}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={() => submit('draft')}
                disabled={submitting}
                className="px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50"
              >
                {submitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="ml-3 inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default ApplicationForm;