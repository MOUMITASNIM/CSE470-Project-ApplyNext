import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Clock, 
  DollarSign, 
  Bookmark, 
  CheckCircle, 
  ArrowLeft 
} from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data.data);
        
        // Check if course is bookmarked
        try {
          const bookmarkResponse = await axios.get('/api/user/bookmarks');
          const isBookmarked = bookmarkResponse.data.data.some(
            (bookmark) => bookmark._id === response.data.data._id
          );
          setBookmarked(isBookmarked);
        } catch (bookmarkError) {
          // User might not be logged in, which is fine
          console.log('User not logged in or bookmark check failed');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleBookmarkToggle = async () => {
    try {
      setBookmarkLoading(true);
      const response = await axios.post(`/api/user/bookmark/${id}`);
      
      if (response.data.success) {
        const newBookmarkState = !bookmarked;
        setBookmarked(newBookmarkState);
        toast.success(newBookmarkState ? 'Course bookmarked!' : 'Bookmark removed');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to bookmark courses');
      } else {
        toast.error('Failed to update bookmark');
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

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
        <Link to="/courses" className="inline-flex items-center text-secondary-600 hover:text-secondary-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
        </Link>
      </div>
      
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-64 md:h-80">
          <img 
            src={course.image || 'https://via.placeholder.com/1200x400?text=No+Image'} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-1" />
                  <span>{course.university}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{course.city}, {course.country}</span>
                </div>
              </div>
            </div>
          </div>
          {course.universityLogo && (
            <div className="absolute top-4 right-4 bg-white p-2 rounded-md shadow-md">
              <img 
                src={course.universityLogo} 
                alt={`${course.university} logo`} 
                className="h-12 w-auto object-contain"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
          </div>
          
          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
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
          
          {/* Highlights */}
          {course.highlights && course.highlights.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Highlights</h2>
              <ul className="space-y-2">
                {course.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Course Details</h3>
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`p-2 rounded-full ${bookmarked ? 'bg-secondary-100 text-secondary-600' : 'bg-gray-100 text-gray-400 hover:text-secondary-600'} transition-colors duration-200`}
                aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2 text-secondary-500" />
                  <span>Application Deadline</span>
                </div>
                <span className="font-medium">{formatDate(course.applicationDeadline)}</span>
              </div>
              
              {course.startDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-secondary-500" />
                    <span>Start Date</span>
                  </div>
                  <span className="font-medium">{formatDate(course.startDate)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <GraduationCap className="h-5 w-5 mr-2 text-secondary-500" />
                  <span>Level</span>
                </div>
                <span className="font-medium">{course.level}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2 text-secondary-500" />
                  <span>Duration</span>
                </div>
                <span className="font-medium">{course.duration}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2 text-secondary-500" />
                  <span>Tuition Fee</span>
                </div>
                <span className="font-medium">
                  {course.tuitionFee.toLocaleString()} {course.currency}
                </span>
              </div>
            </div>
            
            <Link 
              to={`/apply/${course._id}`}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-200"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;