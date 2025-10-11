import React, { useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';
import { Company } from '../../types';

interface CompanyReviewFormProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: any) => Promise<void>;
  currentUser: any;
}

const CompanyReviewForm: React.FC<CompanyReviewFormProps> = ({
  company,
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [step, setStep] = useState<'rating' | 'details' | 'review' | 'success'>('rating');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review: '',
    pros: '',
    cons: '',
    position: '',
    employmentStatus: 'current' as 'current' | 'former' | 'intern',
    isAnonymous: false,
  });

  const [hoveredStar, setHoveredStar] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!formData.title.trim()) {
      setError('Please add a title');
      return;
    }
    if (!formData.review.trim() || formData.review.length < 50) {
      setError('Review must be at least 50 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      setStep('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      rating: 0,
      title: '',
      review: '',
      pros: '',
      cons: '',
      position: '',
      employmentStatus: 'current',
      isAnonymous: false,
    });
    setStep('rating');
    setError(null);
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review {company.name}</h2>
            <p className="text-gray-600 text-sm mt-1">Share your experience</p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close review form"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Screen */}
        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h3>
            <p className="text-gray-600">
              Thank you for sharing your experience with {company.name}
            </p>
          </div>
        )}

        {/* Step 1: Rating */}
        {step === 'rating' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Overall Rating</h3>
              <p className="text-gray-600">
                How would you rate your overall experience at {company.name}?
              </p>
            </div>

            <div className="flex justify-center space-x-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoveredStar || formData.rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {formData.rating > 0 && (
              <div className="text-center mb-8">
                <p className="text-lg font-semibold text-gray-900">
                  {formData.rating === 5
                    ? 'Excellent!'
                    : formData.rating === 4
                    ? 'Great!'
                    : formData.rating === 3
                    ? 'Good'
                    : formData.rating === 2
                    ? 'Fair'
                    : 'Poor'}
                </p>
              </div>
            )}

            {error && <div className="text-red-600 text-sm text-center mb-4">{error}</div>}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (formData.rating === 0) {
                    setError('Please select a rating');
                  } else {
                    setError(null);
                    setStep('details');
                  }
                }}
                disabled={formData.rating === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <div className="p-8 space-y-6">
            <div>
              <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                id="review-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Summarize your experience in one line"
                className="input w-full"
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            <div>
              <label htmlFor="position-field" className="block text-sm font-medium text-gray-700 mb-2">
                Your Position
              </label>
              <input
                id="position-field"
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Software Engineer"
                className="input w-full"
              />
            </div>

            <div>
              <label htmlFor="employment-status" className="block text-sm font-medium text-gray-700 mb-2">
                Employment Status *
              </label>
              <select
                id="employment-status"
                value={formData.employmentStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employmentStatus: e.target.value as any,
                  })
                }
                className="input w-full"
              >
                <option value="current">Current Employee</option>
                <option value="former">Former Employee</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="anonymous-checkbox"
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) =>
                  setFormData({ ...formData, isAnonymous: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="anonymous-checkbox" className="ml-2 text-sm text-gray-700">
                Post anonymously (your name won't be shown)
              </label>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep('rating')} className="btn-secondary">
                Back
              </button>
              <button
                onClick={() => {
                  if (!formData.title.trim()) {
                    setError('Please add a title');
                  } else {
                    setError(null);
                    setStep('review');
                  }
                }}
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div className="p-8 space-y-6">
            <div>
              <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                id="review-text"
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                placeholder="Share your overall experience working at this company..."
                className="input w-full h-32 resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between text-sm mt-1">
                <p className="text-gray-500">Minimum 50 characters</p>
                <p
                  className={`${
                    formData.review.length < 50
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {formData.review.length}/2000
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="pros-text" className="block text-sm font-medium text-gray-700 mb-2">
                Pros
              </label>
              <textarea
                id="pros-text"
                value={formData.pros}
                onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                placeholder="What did you like about working here?"
                className="input w-full h-24 resize-none"
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">{formData.pros.length}/1000</p>
            </div>

            <div>
              <label htmlFor="cons-text" className="block text-sm font-medium text-gray-700 mb-2">
                Cons
              </label>
              <textarea
                id="cons-text"
                value={formData.cons}
                onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                placeholder="What could be improved?"
                className="input w-full h-24 resize-none"
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">{formData.cons.length}/1000</p>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep('details')} disabled={submitting} className="btn-secondary">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || formData.review.length < 50}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyReviewForm;
