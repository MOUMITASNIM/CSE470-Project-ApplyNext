import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Heart,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Courses = () => {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    level: '',
    field: '',
    currency: '',
    duration: '',
    featured: false,
    minFee: '',
    maxFee: '',
    minRating: ''
  });
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkedCourses, setBookmarkedCourses] = useState(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scholarships, setScholarships] = useState([]);

  useEffect(() => {
    fetchCourses();
    if (isAuthenticated) {
      fetchBookmarkedCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, page]);

  useEffect(() => {
    fetchScholarships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.country) params.append('country', filters.country);
      if (filters.city) params.append('city', filters.city);
      if (filters.level) params.append('level', filters.level);
      if (filters.field) params.append('field', filters.field);
      if (filters.currency) params.append('currency', filters.currency);
      if (filters.duration) params.append('duration', filters.duration);
      if (filters.featured) params.append('featured', 'true');
      if (filters.minFee) params.append('minFee', filters.minFee);
      if (filters.maxFee) params.append('maxFee', filters.maxFee);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (sort) params.append('sort', sort);
      params.append('page', String(page));
      params.append('limit', '9');

      const response = await axios.get(`/api/courses?${params.toString()}`);
      setCourses(response.data.data.courses);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchScholarships = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.country) params.append('country', filters.country);
      const response = await axios.get(`/api/scholarships?${params.toString()}`);
      setScholarships(response.data.data.scholarships || []);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    }
  };

  const fetchBookmarkedCourses = async () => {
    try {
      const response = await axios.get('/api/user/bookmarks');
      const bookmarkedIds = new Set(response.data.data.bookmarkedCourses.map(course => course._id));
      setBookmarkedCourses(bookmarkedIds);
    } catch (error) {
      console.error('Error fetching bookmarked courses:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const handleBookmark = async (courseId) => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark courses');
      return;
    }

    try {
      const response = await axios.post(`/api/user/bookmark/${courseId}`);
      if (response.data.bookmarked) {
        setBookmarkedCourses(prev => new Set([...prev, courseId]));
        toast.success('Course bookmarked successfully');
      } else {
        setBookmarkedCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
        toast.success('Course removed from bookmarks');
      }
    } catch (error) {
      console.error('Error bookmarking course:', error);
      toast.error('Failed to bookmark course');
    }
  };

  const countries = ['Canada', 'Australia', 'United Kingdom', 'France', 'United States'];
  const levels = ['Undergraduate', 'Graduate', 'PhD', 'Diploma', 'Certificate'];
  const fields = ['Computer Science', 'Business Administration', 'Engineering', 'Medicine', 'International Relations'];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
          <p className="text-gray-600">Discover world-class education opportunities from leading universities</p>
        </div>

        {/* Advanced Search & Filters */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Compact primary search row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, university or field"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ country: '', city: '', level: '', field: '', currency: '', duration: '', featured: false, minFee: '', maxFee: '', minRating: '' });
                    setSort('newest');
                    setPage(1);
                    fetchCourses();
                  }}
                  className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(s => !s)}
                  className="flex items-center text-sm text-primary-700"
                >
                  <Filter className="h-4 w-4 mr-1" /> {showAdvanced ? 'Hide Advanced' : 'Advanced Filters'}
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm" />
            </div>

            {/* Advanced panel */}
            {showAdvanced && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                <select
                  value={filters.field}
                  onChange={(e) => handleFilterChange('field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Fields</option>
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={filters.currency}
                  onChange={(e) => handleFilterChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  {currencies.map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tuition Fee (Min)</label>
                <input
                  type="number"
                  value={filters.minFee}
                  onChange={(e) => handleFilterChange('minFee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tuition Fee (Max)</label>
                <input
                  type="number"
                  value={filters.maxFee}
                  onChange={(e) => handleFilterChange('maxFee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="100000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 4.5"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="featured"
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured only</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Rating: High to Low</option>
                  <option value="rating_asc">Rating: Low to High</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-between items-center">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Courses
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ country: '', city: '', level: '', field: '', currency: '', duration: '', featured: false, minFee: '', maxFee: '', minRating: '' });
                    setSort('newest');
                    setPage(1);
                    fetchCourses();
                  }}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            </>
            )}
          </form>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {courses.length} Course{courses.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ country: '', level: '', field: '' });
                fetchCourses();
              }}
              className="btn-primary"
            >
              View All Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="card overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                    {course.currency} {course.tuitionFee?.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleBookmark(course._id)}
                    className={`absolute top-4 left-4 p-2 rounded-full transition-colors duration-200 ${
                      bookmarkedCourses.has(course._id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${bookmarkedCourses.has(course._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {course.level}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{course.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {course.university}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs font-medium rounded">
                        {course.field}
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-primary text-sm"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scholarships Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Scholarships</h2>
            <span className="text-sm text-gray-600">{scholarships.length} found</span>
          </div>
          {scholarships.length === 0 ? (
            <div className="text-center py-10 text-gray-600">No scholarships available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.map((s) => (
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
                    <div className="flex justify-end">
                      <Link to={`/scholarships/${s._id}`} className="btn-primary text-sm">View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              className="px-3 py-2 border rounded disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-2 border rounded disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses; 