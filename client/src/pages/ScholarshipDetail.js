import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowLeft, 
  CheckCircle, 
  Award,
  Clock,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/scholarships/${id}`);
        setScholarship(res.data.data);
        if (isAuthenticated) {
          // Fetch user's bookmarks and check
          const b = await axios.get('/api/user/bookmarks');
          const ids = (b.data?.data?.bookmarkedScholarships || []).map(s => s._id);
          setIsBookmarked(ids.includes(id));

          // Check if already applied for this scholarship (non-draft)
          try {
            const apps = await axios.get('/api/user/applications');
            const list = apps.data?.data?.applications || [];
            const applied = list.some(a => a.type === 'scholarship' && a.scholarship?._id === id);
            setHasApplied(applied);
          } catch {}
        }
      } catch (e) {
        toast.error('Failed to load scholarship');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark');
      return;
    }
    try {
      const res = await axios.post(`/api/user/bookmark-scholarship/${id}`);
      const nowBookmarked = !!res.data?.bookmarked;
      setIsBookmarked(nowBookmarked);
      toast.success(nowBookmarked ? 'Scholarship bookmarked' : 'Removed from bookmarks');
    } catch (e) {
      toast.error('Failed to toggle bookmark');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Scholarship not found</h2>
          <p className="text-gray-600 mb-6">The scholarship you're looking for doesn't exist.</p>
          <Link to="/courses" className="btn-primary">Browse All Scholarships</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/courses" className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Explore
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Scholarship Header */}
            <div className="card p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-sm font-medium rounded-full">
                      {scholarship.type || 'Scholarship'}
                    </span>
                    <span className="px-3 py-1 bg-secondary-100 text-secondary-600 text-sm font-medium rounded-full">
                      {scholarship.field || 'General'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{scholarship.title}</h1>
                  <p className="text-gray-600 text-lg">{scholarship.shortDescription}</p>
                </div>
                <button
                  onClick={handleBookmark}
                  className={`p-3 rounded-full transition-colors duration-200 ${
                    isBookmarked
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-sm">{scholarship.university}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="text-sm">Deadline: {formatDate(scholarship.applicationDeadline)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  <span className="text-sm">{scholarship.level || 'All Levels'}</span>
                </div>
                {typeof scholarship.amount !== 'undefined' && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span className="text-sm">{scholarship.currency || 'USD'} {scholarship.amount?.toLocaleString?.() || scholarship.amount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card overflow-hidden mb-6">
              <img src={scholarship.image} alt={scholarship.title} className="w-full h-64 md:h-96 object-cover" />
            </div>

            {/* Scholarship Details */}
            <div className="card p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Scholarship Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">University</h3>
                  <p className="text-gray-600">{scholarship.university}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Country</h3>
                  <p className="text-gray-600">{scholarship.country}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Application Deadline</h3>
                  <p className="text-gray-600">{formatDate(scholarship.applicationDeadline)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Scholarship Amount</h3>
                  <p className="text-gray-600">
                    {scholarship.currency || 'USD'} {scholarship.amount?.toLocaleString?.() || scholarship.amount || 'Varies'}
                  </p>
                </div>
                {scholarship.duration && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Duration</h3>
                    <p className="text-gray-600">{scholarship.duration}</p>
                  </div>
                )}
                {scholarship.applicationFee && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Application Fee</h3>
                    <p className="text-gray-600">
                      {scholarship.currency || 'USD'} {scholarship.applicationFee?.toLocaleString?.() || scholarship.applicationFee}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* About Scholarship */}
            <div className="card p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this scholarship</h2>
              <p className="text-gray-700 whitespace-pre-line">{scholarship.description}</p>
            </div>

            {/* Eligibility Requirements */}
            {scholarship.eligibility && scholarship.eligibility.length > 0 && (
              <div className="card p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligibility Requirements</h2>
                <ul className="space-y-2">
                  {scholarship.eligibility.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {scholarship.benefits && scholarship.benefits.length > 0 && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Scholarship Benefits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scholarship.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Apply Card */}
            <div className="card p-6 mb-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Apply Now</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    {scholarship.currency || 'USD'} {scholarship.amount?.toLocaleString?.() || scholarship.amount || 'Varies'}
                  </div>
                  <p className="text-gray-600 text-sm">Scholarship Amount</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">University:</span>
                    <span className="font-medium">{scholarship.university}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Country:</span>
                    <span className="font-medium">{scholarship.country}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="font-medium">{formatDate(scholarship.applicationDeadline)}</span>
                  </div>
                  {scholarship.applicationFee && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Application Fee:</span>
                      <span className="font-medium">{scholarship.currency || 'USD'} {scholarship.applicationFee?.toLocaleString?.() || scholarship.applicationFee}</span>
                    </div>
                  )}
                </div>

                <button
                  className={`btn-primary w-full ${hasApplied ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => isAuthenticated ? navigate(`/apply/scholarship/${id}`) : navigate('/login')}
                  disabled={hasApplied}
                >
                  {hasApplied ? 'Already Applied' : 'Apply for this Scholarship'}
                </button>
                
                <button
                  onClick={handleBookmark}
                  className={`w-full py-3 px-4 rounded-lg border-2 font-medium transition-colors duration-200 ${
                    isBookmarked
                      ? 'border-red-500 text-red-600 hover:bg-red-50'
                      : 'border-primary-600 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'}
                </button>
              </div>
            </div>

            {/* University Info */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About {scholarship.university}</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{scholarship.country}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">Leading University</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Award className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="text-sm">Scholarship Provider</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;
