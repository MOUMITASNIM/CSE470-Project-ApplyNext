import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ApplicationStatus = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const statusColors = {
  [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ApplicationStatus.REVIEWING]: 'bg-blue-100 text-blue-800',
  [ApplicationStatus.APPROVED]: 'bg-green-100 text-green-800',
  [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800'
};

const ApplicationDetails = ({ application, onClose, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(application.status);
  const [adminNotes, setAdminNotes] = useState(application.adminNotes || '');

  const handleStatusChange = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/admin/applications/${application._id}`, {
        status,
        adminNotes
      });
      toast.success('Application status updated');
      onStatusChange(application._id, status, adminNotes);
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Application Details</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Course and User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Course Information</h3>
              <p><span className="font-medium">Title:</span> {application.course?.title}</p>
              <p><span className="font-medium">University:</span> {application.course?.university}</p>
              <p><span className="font-medium">Country:</span> {application.course?.country}</p>
              <p><span className="font-medium">Level:</span> {application.course?.level}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Applicant Information</h3>
              <p><span className="font-medium">Name:</span> {application.user?.name}</p>
              <p><span className="font-medium">Email:</span> {application.user?.email}</p>
              <p><span className="font-medium">Applied on:</span> {new Date(application.createdAt).toLocaleDateString()}</p>
              <p>
                <span className="font-medium">Status:</span> 
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </p>
            </div>
          </div>
          
          {/* Personal Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><span className="font-medium">First Name:</span> {application.firstName}</p>
              <p><span className="font-medium">Last Name:</span> {application.lastName}</p>
              <p><span className="font-medium">Email:</span> {application.email}</p>
              <p><span className="font-medium">Phone:</span> {application.phone}</p>
              <p><span className="font-medium">Nationality:</span> {application.nationality}</p>
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><span className="font-medium">Education Level:</span> {application.education}</p>
              <p><span className="font-medium">Current University:</span> {application.currentUniversity || 'N/A'}</p>
              <p><span className="font-medium">GPA:</span> {application.gpa}</p>
            </div>
          </div>
          
          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cover Letter</h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}
          
          {/* Admin Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Review</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                <option value={ApplicationStatus.PENDING}>Pending</option>
                <option value={ApplicationStatus.REVIEWING}>Reviewing</option>
                <option value={ApplicationStatus.APPROVED}>Approved</option>
                <option value={ApplicationStatus.REJECTED}>Rejected</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                placeholder="Add notes about this application..."
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleStatusChange}
                disabled={loading || (status === application.status && adminNotes === application.adminNotes)}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/applications');
      setApplications(response.data.data);
      setFilteredApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.user?.name?.toLowerCase().includes(term) ||
        app.user?.email?.toLowerCase().includes(term) ||
        app.course?.title?.toLowerCase().includes(term) ||
        app.course?.university?.toLowerCase().includes(term)
      );
    }
    
    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'userName') {
          aValue = a.user?.name || '';
          bValue = b.user?.name || '';
        } else if (sortConfig.key === 'courseTitle') {
          aValue = a.course?.title || '';
          bValue = b.course?.title || '';
        } else if (sortConfig.key === 'university') {
          aValue = a.course?.university || '';
          bValue = b.course?.university || '';
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredApplications(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sorted = [...filteredApplications].sort((a, b) => {
      let aValue, bValue;
      
      if (key === 'userName') {
        aValue = a.user?.name || '';
        bValue = b.user?.name || '';
      } else if (key === 'courseTitle') {
        aValue = a.course?.title || '';
        bValue = b.course?.title || '';
      } else if (key === 'university') {
        aValue = a.course?.university || '';
        bValue = b.course?.university || '';
      } else {
        aValue = a[key];
        bValue = b[key];
      }
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredApplications(sorted);
  };

  const handleStatusChange = (id, newStatus, adminNotes) => {
    const updatedApplications = applications.map(app => 
      app._id === id ? { ...app, status: newStatus, adminNotes } : app
    );
    setApplications(updatedApplications);
    setSelectedApplication(null);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  if (loading && applications.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Applicants</h1>
      
      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </div>
        
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
          >
            <option value="all">All Statuses</option>
            <option value={ApplicationStatus.PENDING}>Pending</option>
            <option value={ApplicationStatus.REVIEWING}>Reviewing</option>
            <option value={ApplicationStatus.APPROVED}>Approved</option>
            <option value={ApplicationStatus.REJECTED}>Rejected</option>
          </select>
        </div>
      </div>
      
      {/* Applications Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  <span>Date Applied</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('userName')}
              >
                <div className="flex items-center">
                  <span>Applicant</span>
                  {renderSortIcon('userName')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('courseTitle')}
              >
                <div className="flex items-center">
                  <span>Course</span>
                  {renderSortIcon('courseTitle')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('university')}
              >
                <div className="flex items-center">
                  <span>University</span>
                  {renderSortIcon('university')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <tr key={application._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.user?.name}</div>
                    <div className="text-sm text-gray-500">{application.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.course?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.course?.university}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="text-secondary-600 hover:text-secondary-900 flex items-center justify-end gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' ? 
                    'No applications match your search criteria.' : 
                    'No applications found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetails 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)} 
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default ManageApplicants;