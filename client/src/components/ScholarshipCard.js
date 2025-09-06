import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Calendar, MapPin, Award, DollarSign } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ScholarshipCard = ({ scholarship, isBookmarked = false, onBookmarkToggle, alreadyApplied = false }) => {
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setLoading(true);
      const response = await axios.post(`/api/user/bookmark/scholarship/${scholarship._id}`);
      
      if (response.data.success) {
        const newBookmarkState = !bookmarked;
        setBookmarked(newBookmarkState);
        toast.success(newBookmarkState ? 'Scholarship bookmarked!' : 'Bookmark removed');
        if (onBookmarkToggle) {
          onBookmarkToggle(scholarship._id, newBookmarkState);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to bookmark scholarships');
      } else {
        toast.error('Failed to update bookmark');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={scholarship.image || 'https://via.placeholder.com/400x200?text=No+Image'} 
          alt={scholarship.title} 
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleBookmarkToggle}
          disabled={loading}
          className={`absolute top-3 right-3 p-2 rounded-full ${bookmarked ? 'bg-secondary-100 text-secondary-600' : 'bg-white text-gray-400 hover:text-secondary-600'} shadow-md transition-colors duration-200`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
        </button>
        {scholarship.universityLogo && (
          <div className="absolute bottom-3 left-3 bg-white p-1 rounded-md shadow-md">
            <img 
              src={scholarship.universityLogo} 
              alt={`${scholarship.university} logo`} 
              className="h-8 w-auto object-contain"
            />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-md shadow-md">
          <Award className="h-4 w-4 inline mr-1" />
          <span className="text-xs font-medium">Scholarship</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{scholarship.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <Award className="h-4 w-4 mr-1" />
          <span className="text-sm">{scholarship.university}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{scholarship.country}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="text-sm">Deadline: {formatDate(scholarship.applicationDeadline)}</span>
        </div>
        
        <div className="flex items-center text-green-600 mb-2">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="text-sm font-semibold">Amount: {formatAmount(scholarship.amount, scholarship.currency)}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Application Fee: {scholarship.currency} {scholarship.applicationFee || 0}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{scholarship.shortDescription}</p>
        
        <div className="flex justify-between gap-2">
          <Link 
            to={`/scholarships/${scholarship._id}`}
            className="flex-1 text-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-200"
          >
            View Details
          </Link>
          {alreadyApplied ? (
            <span className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-green-100 text-green-700 border border-green-200 select-none">
              Already Applied
            </span>
          ) : (
            <Link 
              to={`/apply/scholarship/${scholarship._id}`}
              className="flex-1 text-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-200"
            >
              Apply Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipCard;
