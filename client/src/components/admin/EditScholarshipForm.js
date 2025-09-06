import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const EditScholarshipForm = ({ scholarship, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(scholarship?.image || null);
  const [requirements, setRequirements] = useState(scholarship?.requirements?.length ? scholarship.requirements : ['']);
  const [eligibility, setEligibility] = useState(scholarship?.eligibility?.length ? scholarship.eligibility : ['']);

  const [formData, setFormData] = useState({
    title: scholarship?.title || '',
    description: scholarship?.description || '',
    shortDescription: scholarship?.shortDescription || '',
    university: scholarship?.university || '',
    country: scholarship?.country || '',
    amount: scholarship?.amount || '',
    currency: scholarship?.currency || 'USD',
    image: scholarship?.image || '',
    applicationDeadline: scholarship?.applicationDeadline ? scholarship.applicationDeadline.substring(0,10) : '',
    isActive: scholarship?.isActive !== undefined ? scholarship.isActive : true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (index) => setRequirements(requirements.filter((_, i) => i !== index));
  const handleRequirementChange = (index, value) => {
    const copy = [...requirements];
    copy[index] = value;
    setRequirements(copy);
  };

  const addEligibility = () => setEligibility([...eligibility, '']);
  const removeEligibility = (index) => setEligibility(eligibility.filter((_, i) => i !== index));
  const handleEligibilityChange = (index, value) => {
    const copy = [...eligibility];
    copy[index] = value;
    setEligibility(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      requirements: requirements.filter(r => r.trim() !== ''),
      eligibility: eligibility.filter(h => h.trim() !== '')
    };
    try {
      setLoading(true);
      const res = await axios.put(`/api/admin/scholarships/${scholarship._id}`, payload);
      if (res.data.success) {
        toast.success('Scholarship updated');
        onSaved && onSaved(res.data.data);
        onClose && onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update scholarship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Edit Scholarship</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} required rows="3" maxLength={200} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                  <select name="currency" value={formData.currency} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline *</label>
                <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="mt-1 flex items-center">
                  <label className="block w-full">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      {imagePreview ? (
                        <div className="relative w-full h-32">
                          <img src={imagePreview} alt="Scholarship preview" className="h-full w-full object-cover rounded-lg" />
                          <button type="button" onClick={() => { setImagePreview(null); setFormData({ ...formData, image: '' }); }} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">Upload image</div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex items-center">
                <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-gray-300 rounded" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active (Visible to users)</label>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
              <button type="button" onClick={addRequirement} className="flex items-center text-sm text-secondary-600 hover:text-secondary-800">
                <Plus className="h-4 w-4 mr-1" /> Add Requirement
              </button>
            </div>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={req} onChange={(e) => handleRequirementChange(index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
                  {requirements.length > 1 && (
                    <button type="button" onClick={() => removeRequirement(index)} className="p-2 text-red-500 hover:text-red-700">
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">Eligibility</h3>
              <button type="button" onClick={addEligibility} className="flex items-center text-sm text-secondary-600 hover:text-secondary-800">
                <Plus className="h-4 w-4 mr-1" /> Add Criteria
              </button>
            </div>
            <div className="space-y-2">
              {eligibility.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={item} onChange={(e) => handleEligibilityChange(index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500" />
                  {eligibility.length > 1 && (
                    <button type="button" onClick={() => removeEligibility(index)} className="p-2 text-red-500 hover:text-red-700">
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="pt-5 border-t border-gray-200 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="ml-3 px-4 py-2 rounded-md text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScholarshipForm;
