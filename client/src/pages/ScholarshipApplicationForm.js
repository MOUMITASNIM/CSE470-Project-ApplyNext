import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const ScholarshipApplicationForm = () => {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    passportNumber: '',
    education: 'High School',
    gpa: '',
    essay: '',
    studyPlan: '',
    // File URLs would be managed via upload widgets in a full impl
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [s, u] = await Promise.all([
          axios.get(`/api/scholarships/${scholarshipId}`),
          axios.get('/api/user/profile').catch(() => ({ data: {} })),
        ]);
        setScholarship(s.data?.data);
        const user = u.data?.data || {};
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
        }));

        // Try to load existing draft for this scholarship
        try {
          const apps = await axios.get('/api/user/applications');
          const drafts = apps.data?.data?.drafts || [];
          const draft = drafts.find(d => d.type === 'scholarship' && d.course?._id === scholarshipId);
          if (draft) {
            setFormData(prev => ({
              ...prev,
              firstName: draft.firstName || prev.firstName,
              lastName: draft.lastName || prev.lastName,
              email: draft.email || prev.email,
              phone: draft.phone || prev.phone,
              nationality: draft.nationality || prev.nationality,
              education: draft.education || prev.education,
              gpa: draft.gpa || prev.gpa,
              essay: draft.essay || prev.essay,
              studyPlan: draft.studyPlan || prev.studyPlan,
              passportNumber: draft.passportNumber || prev.passportNumber,
            }));
            toast.success('Loaded saved draft');
          }
        } catch {}
      } catch (e) {
        toast.error('Failed to load scholarship');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [scholarshipId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const required = ['firstName','lastName','email','phone','nationality','education','gpa'];
    for (const f of required) {
      if (!formData[f]) { toast.error('Please fill in all required fields'); return false; }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { toast.error('Invalid email'); return false; }
    const g = parseFloat(formData.gpa);
    if (isNaN(g) || g < 0 || g > 4) { toast.error('GPA must be 0-4'); return false; }
    return true;
  };

  const submit = async (status) => {
    if (status !== 'draft' && !validate()) return;
    try {
      setSubmitting(true);
      const res = await axios.post(`/api/user/apply-scholarship/${scholarshipId}`, { ...formData, status });
      if (res.data?.success) {
        if (status === 'draft') {
          toast.success('Draft saved');
          navigate(`/scholarships/${scholarshipId}`);
        } else {
          setShowSuccessModal(true);
        }
      }
    } catch (e) {
      if (e.response?.status === 401) {
        toast.error('Please log in to apply');
        navigate('/login');
      } else {
        toast.error('Failed to submit application');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Application Submitted!</h3>
          <p className="text-sm text-gray-500 mb-6">
            Your application for {scholarship?.title} has been successfully submitted.
          </p>
          <div className="flex justify-center space-x-4">
            <button onClick={() => navigate('/profile')} className="px-4 py-2 rounded-md text-sm text-white bg-secondary-600 hover:bg-secondary-700">Go to Profile</button>
            <button onClick={() => navigate('/courses')} className="px-4 py-2 rounded-md text-sm border bg-white hover:bg-gray-50">Browse More</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-500"></div>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Scholarship not found</div>
        <div className="mt-4">
          <Link to="/courses" className="inline-flex items-center text-secondary-600 hover:text-secondary-800"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to={`/scholarships/${scholarshipId}`} className="inline-flex items-center text-secondary-600 hover:text-secondary-800"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Scholarship Details</Link>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Apply for {scholarship.title}</h1>
          <p className="text-gray-600 mt-1">{scholarship.university}, {scholarship.country}</p>
        </div>
        <form className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); submit('pending'); }}>
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g. +1234567890" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                <input name="nationality" value={formData.nationality} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <input name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
            </div>
          </div>

          {/* Educational Records */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Educational Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highest Education Level *</label>
                <select name="education" value={formData.education} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500">
                  <option value="High School">High School</option>
                  <option value="Associate's Degree">Associate's Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA (0-4) *</label>
                <input type="number" step="0.01" min="0" max="4" name="gpa" value={formData.gpa} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" />
              </div>
            </div>
          </div>

          {/* Essay */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Statement of Purpose / Scholarship Essay</h2>
            <textarea name="essay" value={formData.essay} onChange={handleChange} rows="6" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" placeholder="Write your essay here..." />
          </div>

          {/* Study Plan */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Research Proposal / Study Plan (optional)</h2>
            <textarea name="studyPlan" value={formData.studyPlan} onChange={handleChange} rows="4" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500" placeholder="Describe your proposed research or study plan..." />
          </div>

          {/* Actions */}
          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <Link to={`/scholarships/${scholarshipId}`} className="px-4 py-2 border rounded-md text-sm">Cancel</Link>
              <button type="button" onClick={() => submit('draft')} disabled={submitting} className="px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50">{submitting ? 'Saving...' : 'Save Draft'}</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md text-sm text-white bg-secondary-600 hover:bg-secondary-700">{submitting ? 'Submitting...' : 'Submit Application'}</button>
            </div>
          </div>
        </form>
      </div>
      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default ScholarshipApplicationForm;
