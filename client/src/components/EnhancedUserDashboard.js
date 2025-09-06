import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, FileText, CreditCard, BookmarkIcon, Settings } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PaymentHistory from './PaymentHistory';

const EnhancedUserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchApplications();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/user/applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get('/api/user/bookmarks');
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'payments', label: 'Payment History', icon: CreditCard },
    { id: 'bookmarks', label: 'Bookmarks', icon: BookmarkIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              {user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nationality</label>
                    <p className="mt-1 text-sm text-gray-900">{user.nationality || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
              <span className="text-sm text-gray-500">{applications.length} total applications</span>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-600">You haven't submitted any applications yet.</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <li key={application._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={application.course?.image || application.scholarship?.image || 'https://via.placeholder.com/40x40'}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {application.course?.title || application.scholarship?.title}
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                              {application.paymentStatus === 'paid' && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Paid
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <p>
                                Applied on {formatDate(application.createdAt)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {application.course?.university || application.scholarship?.university}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {application.course ? 'Course Application' : 'Scholarship Application'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'payments':
        return <PaymentHistory />;

      case 'bookmarks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Bookmarked Items</h2>
              <span className="text-sm text-gray-500">{bookmarks.length} bookmarks</span>
            </div>
            
            {bookmarks.length === 0 ? (
              <div className="text-center py-8">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookmarks Yet</h3>
                <p className="text-gray-600">You haven't bookmarked any courses or scholarships yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img
                      src={item.image || 'https://via.placeholder.com/300x200'}
                      alt={item.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{item.university}</p>
                      <p className="text-sm text-gray-500">{item.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your applications, payments, and profile</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-secondary-500 text-secondary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserDashboard;
