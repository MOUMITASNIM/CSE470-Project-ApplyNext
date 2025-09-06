import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookmarkX, MapPin } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import toast from 'react-hot-toast';

const BookmarksPage = () => {
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
  const [bookmarkedScholarships, setBookmarkedScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedCourseIds, setAppliedCourseIds] = useState(new Set());

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const [bookmarksResp, appsResp] = await Promise.all([
        axios.get('/api/user/bookmarks'),
        axios.get('/api/user/applications')
      ]);

      if (bookmarksResp.data.success) {
        const { bookmarkedCourses: courses = [], bookmarkedScholarships: scholarships = [] } = bookmarksResp.data.data || {};
        setBookmarkedCourses(courses);
        setBookmarkedScholarships(scholarships);
      } else {
        setError('Failed to fetch bookmarks');
      }

      if (appsResp.data.success) {
        const apps = appsResp.data.data?.applications || [];
        const ids = new Set(apps.filter(a => a.type === 'course').map(a => a.course?._id).filter(Boolean));
        setAppliedCourseIds(ids);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      if (err.response?.status === 401) {
        setError('Please log in to view your bookmarks');
      } else {
        setError('Failed to load bookmarks. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCourseBookmark = async (courseId) => {
    try {
      const response = await axios.delete(`/api/user/bookmark/${courseId}`);
      if (response.data.success) {
        setBookmarkedCourses(bookmarkedCourses.filter(course => course._id !== courseId));
        toast.success('Course removed from bookmarks');
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
      toast.error('Failed to remove bookmark. Please try again.');
    }
  };

  const handleRemoveScholarshipBookmark = async (scholarshipId) => {
    try {
      const response = await axios.delete(`/api/user/bookmark-scholarship/${scholarshipId}`);
      if (response.data.success) {
        setBookmarkedScholarships(bookmarkedScholarships.filter(s => s._id !== scholarshipId));
        toast.success('Scholarship removed from bookmarks');
      }
    } catch (err) {
      console.error('Error removing scholarship bookmark:', err);
      toast.error('Failed to remove scholarship bookmark. Please try again.');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
        <Link 
          to="/courses" 
          className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
        >
          Browse Courses
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {!loading && bookmarkedCourses.length === 0 && bookmarkedScholarships.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BookmarkX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No Bookmarks Yet</h2>
          <p className="text-gray-600 mb-6">You haven't bookmarked any courses or scholarships yet. Browse and bookmark the ones you're interested in!</p>
          <Link 
            to="/courses" 
            className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {(bookmarkedCourses.length > 0) && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bookmarked Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedCourses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                isBookmarked={true}
                alreadyApplied={appliedCourseIds.has(course._id)}
                onBookmarkToggle={() => handleRemoveCourseBookmark(course._id)}
              />
            ))}
          </div>
        </div>
      )}

      {(bookmarkedScholarships.length > 0) && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bookmarked Scholarships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedScholarships.map((s) => (
              <div key={s._id} className="card overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  {s.applicationDeadline && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Deadline: {new Date(s.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{s.shortDescription}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {s.university} • {s.country}
                    </div>
                    {typeof s.amount !== 'undefined' && (
                      <div className="font-medium text-secondary-700">{s.currency || 'USD'} {s.amount?.toLocaleString?.() || s.amount}</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <Link to={`/scholarships/${s._id}`} className="btn-outline text-sm">View Details</Link>
                    <button className="btn-danger text-sm" onClick={() => handleRemoveScholarshipBookmark(s._id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;