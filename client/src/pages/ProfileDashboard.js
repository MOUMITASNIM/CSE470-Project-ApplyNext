import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, BookOpen, Clock, CheckCircle, XCircle, Bookmark, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileDashboard = () => {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', nationality: '', university: '' });
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userResponse = await axios.get('/api/user/profile');
        if (userResponse.data.success) {
          setUser(userResponse.data.data);
          const u = userResponse.data.data || {};
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            nationality: u.nationality || '',
            university: u.university || ''
          });
        }
        
        // Fetch user applications
        const applicationsResponse = await axios.get('/api/user/applications');
        if (applicationsResponse.data.success) {
          setApplications(applicationsResponse.data.data.applications || []);
          setDrafts(applicationsResponse.data.data.drafts || []);
        }
        
        // Fetch user bookmarks
        const bookmarksResponse = await axios.get('/api/user/bookmarks');
        if (bookmarksResponse.data.success) {
          const courses = bookmarksResponse.data.data?.bookmarkedCourses || [];
          const scholarships = bookmarksResponse.data.data?.bookmarkedScholarships || [];
          // Combine courses and scholarships with type indicator
          const allBookmarks = [
            ...courses.map(item => ({ ...item, type: 'course' })),
            ...scholarships.map(item => ({ ...item, type: 'scholarship' }))
          ];
          setBookmarks(allBookmarks);
        }
        
        // Fetch user payments
        const paymentsResponse = await axios.get('/api/payments/my-payments');
        if (paymentsResponse.data.payments) {
          setPayments(paymentsResponse.data.payments);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Profile photo handlers
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Convert to base64 and send to backend
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setPhotoUploading(true);
        const base64 = reader.result;
        const resp = await axios.put('/api/user/profile', { profilePicture: base64 });
        if (resp.data?.success !== false) {
          setUser(resp.data.data);
          toast.success('Profile photo updated');
        } else {
          toast.error(resp.data?.message || 'Failed to update photo');
        }
      } catch (err) {
        console.error('Update photo error:', err);
        toast.error('Failed to update photo');
      } finally {
        setPhotoUploading(false);
        // reset the input so same file can be re-selected
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!user?.profileImage) return;
    try {
      setPhotoUploading(true);
      const resp = await axios.put('/api/user/profile', { profilePicture: '' });
      if (resp.data?.success !== false) {
        setUser(resp.data.data);
        toast.success('Profile photo removed');
      } else {
        toast.error(resp.data?.message || 'Failed to remove photo');
      }
    } catch (err) {
      console.error('Remove photo error:', err);
      toast.error('Failed to remove photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemoveBookmark = async (itemId, type) => {
    try {
      const endpoint = type === 'scholarship' 
        ? `/api/user/bookmark-scholarship/${itemId}` 
        : `/api/user/bookmark/${itemId}`;
      const response = await axios.delete(endpoint);
      if (response.data.success) {
        setBookmarks(bookmarks.filter(item => item._id !== itemId));
        toast.success(`${type === 'scholarship' ? 'Scholarship' : 'Course'} removed from bookmarks`);
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
      toast.error('Failed to remove bookmark. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'under_review':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Under Review</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-600">
      <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center">
            <div className="relative">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full overflow-hidden bg-secondary-100 ring-4 ring-white flex items-center justify-center">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-secondary-600" />
                )}
              </div>
              <input
                id="profilePhotoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div className="ml-4 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <label htmlFor="profilePhotoInput" className={`px-3 py-1.5 text-sm rounded-md bg-secondary-600 text-white hover:bg-secondary-700 cursor-pointer ${photoUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  {photoUploading ? 'Uploading...' : (user?.profileImage ? 'Change Photo' : 'Add Photo')}
                </label>
                <button
                  onClick={handleRemovePhoto}
                  disabled={!user?.profileImage || photoUploading}
                  className="px-3 py-1.5 text-sm rounded-md border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Remove Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => { setIsEditing(true); setForm({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    nationality: user?.nationality || '',
                    university: user?.university || ''
                  }); }}
                  className="px-4 py-2 text-sm rounded-md bg-secondary-600 text-white hover:bg-secondary-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      try {
                        setSaving(true);
                        const resp = await axios.put('/api/user/profile', { ...form });
                        if (resp.data?.success) {
                          setUser(resp.data.data);
                          toast.success('Profile updated successfully');
                          setIsEditing(false);
                        } else {
                          toast.error(resp.data?.message || 'Failed to update profile');
                        }
                      } catch (err) {
                        console.error('Update profile error:', err);
                        toast.error('Failed to update profile');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="px-4 py-2 text-sm rounded-md bg-secondary-600 text-white hover:bg-secondary-700 disabled:opacity-60"
                  >{saving ? 'Saving...' : 'Save'}</button>
                  <button
                    onClick={() => { setIsEditing(false); setForm({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      nationality: user?.nationality || '',
                      university: user?.university || ''
                    }); }}
                    className="px-4 py-2 text-sm rounded-md border text-gray-700 hover:bg-gray-50"
                  >Cancel</button>
                </>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Name</p>
              {isEditing ? (
                <input name="name" value={form.name} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white" />
              ) : (
                <p className="font-medium">{user?.name || '—'}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              {isEditing ? (
                <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white" />
              ) : (
                <p className="font-medium">{user?.email || '—'}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              {isEditing ? (
                <input name="phone" value={form.phone} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white" />
              ) : (
                <p className="font-medium">{user?.phone || '—'}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500">Nationality</p>
              {isEditing ? (
                <input name="nationality" value={form.nationality} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white" />
              ) : (
                <p className="font-medium">{user?.nationality || '—'}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500">University</p>
              {isEditing ? (
                <input name="university" value={form.university} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white" />
              ) : (
                <p className="font-medium">{user?.university || '—'}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500">Member Since</p>
              <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('applications')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'applications' ? 'border-secondary-500 text-secondary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Applications
                <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs">{applications.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'bookmarks' ? 'border-secondary-500 text-secondary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-center">
                <Bookmark className="h-5 w-5 mr-2" />
                Bookmarks
                <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs">{bookmarks.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'payments' ? 'border-secondary-500 text-secondary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payments
                <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs">{payments.length}</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">My Applications</h2>
                <Link 
                  to="/courses" 
                  className="px-3 py-1 bg-secondary-600 text-white text-sm rounded-md hover:bg-secondary-700 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>

              {/* Drafts Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Drafts</h3>
                  <span className="text-sm text-gray-600">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
                </div>
                {drafts.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">No drafts yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {drafts.map((d) => (
                          <tr key={d._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{d.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.course?.title || d.scholarship?.title || 'Untitled'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.course?.university || d.scholarship?.university || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-3">
                                <Link
                                  to={d.type === 'course' ? `/apply/${d.course?._id}` : `/apply/scholarship/${d.scholarship?._id}`}
                                  className="text-secondary-600 hover:text-secondary-900"
                                >
                                  Continue
                                </Link>
                                <button
                                  onClick={async () => {
                                    try {
                                      await axios.put(`/api/user/application-draft/${d.type}/${d._id}/submit`);
                                      toast.success('Draft submitted');
                                      setDrafts(prev => prev.filter(x => x._id !== d._id));
                                      setApplications(prev => [{ ...d, status: 'pending' }, ...prev]);
                                    } catch (err) {
                                      console.error('Submit draft error:', err);
                                      toast.error('Failed to submit draft');
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Submit
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await axios.delete(`/api/user/application-draft/${d.type}/${d._id}`);
                                      toast.success('Draft deleted');
                                      setDrafts(prev => prev.filter(x => x._id !== d._id));
                                    } catch (err) {
                                      console.error('Delete draft error:', err);
                                      toast.error('Failed to delete draft');
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {applications.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">You haven't applied to any courses yet. Browse our courses and start your application!</p>
                  <Link 
                    to="/courses" 
                    className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((application) => (
                        <tr key={application._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{application.course?.title || application.scholarship?.title || 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{application.course?.university || application.scholarship?.university || 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(application.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(application.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link 
                              to={application.type === 'scholarship' ? `/scholarships/${application.scholarship?._id}` : `/courses/${application.course?._id}`} 
                              className="text-secondary-600 hover:text-secondary-900"
                            >
                              {application.type === 'scholarship' ? 'View Scholarship' : 'View Course'}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">My Bookmarks</h2>
                <Link 
                  to="/bookmarks" 
                  className="px-3 py-1 bg-secondary-600 text-white text-sm rounded-md hover:bg-secondary-700 transition-colors"
                >
                  View All Bookmarks
                </Link>
              </div>

              {bookmarks.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Bookmarked Courses</h3>
                  <p className="text-gray-600 mb-6">You haven't bookmarked any courses yet. Browse our courses and bookmark the ones you're interested in!</p>
                  <Link 
                    to="/courses" 
                    className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bookmarks.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.type === 'scholarship' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.type === 'scholarship' ? 'Scholarship' : 'Course'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.university}</p>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {item.description || item.shortDescription}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-secondary-600">
                            {item.currency} {item.type === 'scholarship' ? item.amount : item.tuitionFee}
                          </span>
                          <Link
                            to={item.type === 'scholarship' ? `/scholarships/${item._id}` : `/courses/${item._id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
              </div>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your payment history will appear here after you make payments for course applications.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/courses"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
                    >
                      Browse Courses
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Payment Summary */}
                  <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Total Payments</h3>
                        <p className="text-sm text-gray-600">Your payment summary</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-secondary-600">
                          ${payments.reduce((total, payment) => total + payment.amount, 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">{payments.length} transactions</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment List */}
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <li key={payment._id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  payment.status === 'completed' 
                                    ? 'bg-green-100 text-green-600' 
                                    : payment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  {payment.status === 'completed' ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : payment.status === 'pending' ? (
                                    <Clock className="h-5 w-5" />
                                  ) : (
                                    <XCircle className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900">
                                    {payment.course?.title || payment.scholarship?.title || 'Application Payment'}
                                  </p>
                                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    payment.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <p>
                                    {payment.course?.university || payment.scholarship?.university || 'Unknown'}
                                  </p>
                                  <span className="mx-2">•</span>
                                  <p>
                                    {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  {payment.paidAt && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <p>
                                        Paid: {new Date(payment.paidAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <p className="text-lg font-semibold text-gray-900">
                                {payment.currency.toUpperCase()} {payment.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete account?</h3>
              <p className="text-gray-600">This action is permanent. All your data, including applications and bookmarks, will be deleted. Type DELETE to confirm.</p>
              <input id="confirmText" placeholder="Type DELETE" className="mt-4 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="p-6 pt-0 flex items-center justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => { const v = document.getElementById('confirmText')?.value; if (v !== 'DELETE') { toast.error('Please type DELETE to confirm'); return; } (async () => { try { setDeleting(true); const resp = await axios.delete('/api/user/profile'); if (resp.data?.success !== false) { toast.success('Account deleted'); window.location.href = '/'; } else { toast.error(resp.data?.message || 'Failed to delete account'); } } catch (err) { console.error('Delete account error:', err); toast.error('Failed to delete account'); } finally { setDeleting(false); } })(); }}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                disabled={deleting}
              >{deleting ? 'Deleting...' : 'Delete Account'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
  );
};

export default ProfileDashboard;