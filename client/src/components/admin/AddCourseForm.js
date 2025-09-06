import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const AddCourseForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [requirements, setRequirements] = useState(['']);
  const [highlights, setHighlights] = useState(['']);
  
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    university: '',
    country: '',
    city: '',
    level: 'Undergraduate',
    field: '',
    duration: '',
    tuitionFee: '',
    applicationFee: '',
    currency: 'USD',
    image: '',
    universityLogo: '',
    applicationDeadline: '',
    startDate: '',
    featured: false,
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData({ ...formData, universityLogo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index) => {
    const newRequirements = [...requirements];
    newRequirements.splice(index, 1);
    setRequirements(newRequirements);
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const addHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const removeHighlight = (index) => {
    const newHighlights = [...highlights];
    newHighlights.splice(index, 1);
    setHighlights(newHighlights);
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty requirements and highlights
    const filteredRequirements = requirements.filter(req => req.trim() !== '');
    const filteredHighlights = highlights.filter(highlight => highlight.trim() !== '');
    
    const courseData = {
      ...formData,
      requirements: filteredRequirements,
      highlights: filteredHighlights,
      tuitionFee: parseFloat(formData.tuitionFee),
      applicationFee: parseFloat(formData.applicationFee)
    };
    
    try {
      setLoading(true);
      const response = await axios.post('/api/admin/courses', courseData);
      
      if (response.data.success) {
        toast.success('Course added successfully');
        onSuccess && onSuccess(response.data.data);
        onClose && onClose();
      }
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error(error.response?.data?.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Add New Course</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  required
                  rows="2"
                  maxLength="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  placeholder="Brief overview (max 200 characters)"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/200 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
                  <input
                    type="text"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 2 years"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fee *</label>
                  <input
                    type="number"
                    name="tuitionFee"
                    value={formData.tuitionFee}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Fee *</label>
                  <input
                    type="number"
                    name="applicationFee"
                    value={formData.applicationFee}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Image *</label>
                  <div className="mt-1 flex items-center">
                    <label className="block w-full">
                      <span className="sr-only">Choose course image</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!imagePreview}
                      />
                      <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        {imagePreview ? (
                          <div className="relative w-full h-32">
                            <img 
                              src={imagePreview} 
                              alt="Course preview" 
                              className="h-full w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData({...formData, image: ''});
                              }}
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-secondary-600 hover:text-secondary-500">
                                Upload an image
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University Logo</label>
                  <div className="mt-1 flex items-center">
                    <label className="block w-full">
                      <span className="sr-only">Choose university logo</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        {logoPreview ? (
                          <div className="relative w-full h-32">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="h-full w-full object-contain rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview(null);
                                setFormData({...formData, universityLogo: ''});
                              }}
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-secondary-600 hover:text-secondary-500">
                                Upload a logo
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Requirements Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
              <button
                type="button"
                onClick={addRequirement}
                className="flex items-center text-sm text-secondary-600 hover:text-secondary-800"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Requirement
              </button>
            </div>
            
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder="Enter requirement"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Highlights Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">Highlights</h3>
              <button
                type="button"
                onClick={addHighlight}
                className="flex items-center text-sm text-secondary-600 hover:text-secondary-800"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Highlight
              </button>
            </div>
            
            <div className="space-y-2">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                    placeholder="Enter highlight"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                  {highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Options */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Featured Course
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active (Visible to users)
                </label>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseForm;