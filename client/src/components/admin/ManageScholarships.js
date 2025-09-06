import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit2, 
  Trash2, 
  Search, 
  Plus,
  Award,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import AddScholarshipForm from './AddScholarshipForm';
import EditScholarshipForm from './EditScholarshipForm';
import ConfirmModal from '../common/ConfirmModal';

const ManageScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await axios.get('/api/admin/scholarships');
      if (res.data.success) {
        setScholarships(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      toast.error('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  const handleEditScholarship = (scholarship) => {
    setSelectedScholarship(scholarship);
    setShowEditModal(true);
  };

  const requestDeleteScholarship = (scholarshipId) => {
    setPendingDeleteId(scholarshipId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const scholarshipId = pendingDeleteId;
    try {
      const res = await axios.delete(`/api/admin/scholarships/${scholarshipId}`);
      if (res.data.success) {
        setScholarships(prev => prev.filter(s => s._id !== scholarshipId));
        toast.success('Scholarship deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      toast.error('Failed to delete scholarship');
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleAddScholarship = () => {
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    fetchScholarships(); // Refresh the list after adding
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return 'Not specified';
    
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'CA$',
      AUD: 'A$'
    };
    
    return `${currencySymbols[currency] || ''}${amount.toLocaleString()}`;
  };

  const filteredScholarships = scholarships.filter(scholarship =>
    scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (showAddForm) {
    return <AddScholarshipForm onClose={handleFormClose} />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Scholarship */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button 
          onClick={handleAddScholarship}
          className="flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Scholarship
        </button>
      </div>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholarships.map((scholarship) => (
          <div key={scholarship._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={scholarship.image || 'https://via.placeholder.com/300x200'}
                alt={scholarship.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 right-2">
                <div className="relative inline-block text-left">
                  <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {scholarship.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {scholarship.shortDescription}
              </p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Award className="h-4 w-4 mr-1" />
                  {formatCurrency(scholarship.amount, scholarship.currency)}
                </div>
                <div className="text-sm text-gray-500">
                  Deadline: {formatDate(scholarship.applicationDeadline)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {scholarship.university}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditScholarship(scholarship)}
                    className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-full"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => requestDeleteScholarship(scholarship._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <a
                    href={`/scholarships/${scholarship._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No scholarships found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new scholarship.
          </p>
        </div>
      )}
      {showEditModal && selectedScholarship && (
        <EditScholarshipForm
          scholarship={selectedScholarship}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            setScholarships(prev => prev.map(s => s._id === updated._id ? updated : s));
          }}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Delete Scholarship"
        message="Are you sure you want to delete this scholarship? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
      />
    </div>
  );
};

export default ManageScholarships;