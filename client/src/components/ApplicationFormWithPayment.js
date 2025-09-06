import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, GraduationCap, FileText, CreditCard } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PaymentModal from './PaymentModal';

const ApplicationFormWithPayment = () => {
  const { id } = useParams(); // id of course or scholarship
  const navigate = useNavigate();
  const location = useLocation();
  // Determine type from route path to avoid relying on optional URL params
  const type = location.pathname.includes('/apply/scholarship/') ? 'scholarship' : 'course';
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    education: '',
    currentUniversity: '',
    gpa: '',
    coverLetter: '',
    documents: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchItemDetails();
  }, [id, type]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const endpoint = type === 'scholarship' ? `/api/scholarships/${id}` : `/api/courses/${id}`;
      const response = await axios.get(endpoint);
      
      // Handle different response structures
      let itemData;
      if (response.data.success && response.data.data) {
        // For course: response.data.data.course or scholarship: response.data.data.scholarship
        itemData = response.data.data.course || response.data.data.scholarship || response.data.data;
      } else {
        itemData = response.data;
      }
      
      console.log('Fetched item data:', itemData); // Debug log
      setItem(itemData);
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error(`Failed to fetch ${type} details`);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.education.trim()) newErrors.education = 'Education details are required';
    if (formData.gpa && (isNaN(formData.gpa) || formData.gpa < 0 || formData.gpa > 4)) {
      newErrors.gpa = 'GPA must be a number between 0 and 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    // Don't create application yet - just validate and show payment modal
    // Application will be created only after successful payment
    setShowPaymentModal(true);
    toast.success('Please complete payment to submit your application.');
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setShowPaymentModal(false);
    toast.success('🎉 Payment successful! Your application has been submitted and is now under review.');
    // Navigate to user dashboard after payment completion
    navigate('/profile');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setShowPaymentModal(false);
    toast.error('Payment failed. Please try again.');
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600">The {type} you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex space-x-4">
              <img
                src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              {item.universityLogo && (
                <img
                  src={item.universityLogo}
                  alt={`${item.university} logo`}
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <p className="text-gray-600 mb-2">{item.university}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{item.country}</span>
                {item.level && <span>• {item.level}</span>}
                {item.duration && <span>• {item.duration}</span>}
              </div>
              <div className="mt-3 flex items-center space-x-4">
                <div className="flex items-center text-green-600">
                  <CreditCard className="h-4 w-4 mr-1" />
                  <span className="font-semibold">
                    Application Fee: {formatAmount(item.applicationFee || 0, item.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Form</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality *
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
                  errors.nationality ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your nationality"
              />
              {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>}
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="inline h-4 w-4 mr-1" />
                  Education Background *
                </label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
                    errors.education ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your educational background"
                />
                {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current University
                </label>
                <input
                  type="text"
                  name="currentUniversity"
                  value={formData.currentUniversity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  placeholder="Current university (if any)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA (Optional)
              </label>
              <input
                type="number"
                name="gpa"
                value={formData.gpa}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="4"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
                  errors.gpa ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your GPA (0.00 - 4.00)"
              />
              {errors.gpa && <p className="mt-1 text-sm text-red-600">{errors.gpa}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Cover Letter
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                placeholder="Write a brief cover letter explaining why you're interested in this program..."
              />
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Application Fee</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatAmount(item.applicationFee || 0, item.currency)}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Payment will be processed securely via Stripe</p>
                  <p>You'll be redirected to payment after form submission</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                {submitting ? 'Creating Application...' : 'Proceed to Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          formData={formData}
          itemId={id}
          type={type}
          amount={item.applicationFee}
          currency={item.currency}
          itemName={item.title}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default ApplicationFormWithPayment;
