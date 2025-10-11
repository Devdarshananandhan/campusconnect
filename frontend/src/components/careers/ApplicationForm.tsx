import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  Paperclip,
} from 'lucide-react';
import { Job } from '../../types';

interface ApplicationFormProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (applicationData: {
    resume: string;
    coverLetter: string;
    answers?: Record<string, any>;
  }) => Promise<void>;
  currentUser: any;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  job,
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.includes('pdf') && !file.type.includes('document')) {
        setError('Please upload a PDF or Word document');
        return;
      }
      setResumeFile(file);
      setError('');
      // In a real app, you'd upload this to a server and get a URL
      setResumeUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange({
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      // Validation
      if (!resumeFile && !resumeUrl) {
        throw new Error('Please upload your resume');
      }
      if (!coverLetter.trim()) {
        throw new Error('Please write a cover letter');
      }

      // In a real app, you'd upload the resume file and get a URL
      const applicationData = {
        resume: resumeUrl || 'uploaded-resume-url',
        coverLetter: coverLetter.trim(),
        answers: customAnswers,
      };

      await onSubmit(applicationData);
      
      // Success - show confirmation
      setStep(4);
      setTimeout(() => {
        onClose();
        // Reset form
        setStep(1);
        setResumeFile(null);
        setResumeUrl('');
        setCoverLetter('');
        setCustomAnswers({});
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const companyName =
    typeof job.company === 'object' && job.company !== null
      ? job.company.name
      : 'the company';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold font-display">Apply for Position</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-primary-100">{job.title}</p>
          <p className="text-primary-200 text-sm">{companyName}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
          {['Resume', 'Cover Letter', 'Additional Info', 'Review'].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={stepNum} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Resume Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Resume</h3>
                
                {/* Drag and Drop Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload Resume File"
                  />
                  {resumeFile ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                      <div>
                        <p className="font-semibold text-gray-900">{resumeFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(resumeFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                          setResumeUrl('');
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Drop your resume here or click to browse
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Supported formats: PDF, DOC, DOCX (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-fill from Profile */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Auto-fill from your profile</p>
                      <p className="text-sm text-blue-700 mt-1">
                        We'll pre-fill your information from your CampusConnect profile
                      </p>
                      <div className="mt-3 space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {currentUser?.profile?.name || 'Not set'}</p>
                        <p><span className="font-medium">Email:</span> {currentUser?.email || 'Not set'}</p>
                        <p><span className="font-medium">Major:</span> {currentUser?.profile?.major || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Cover Letter */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tell {companyName} why you're the perfect fit for this role
                </p>

                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={`Dear Hiring Manager,\n\nI am excited to apply for the ${job.title} position at ${companyName}. With my background in...`}
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />

                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    {coverLetter.length} / 1000 characters
                  </p>
                  {coverLetter.length > 0 && coverLetter.length < 100 && (
                    <p className="text-sm text-orange-600">
                      ⚠️ Cover letter seems short. Add more detail!
                    </p>
                  )}
                  {coverLetter.length >= 100 && (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Looks good!
                    </p>
                  )}
                </div>

                {/* Tips */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-900 mb-2">💡 Cover Letter Tips:</p>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Mention specific skills from the job requirements</li>
                    <li>Explain why you're interested in this company</li>
                    <li>Include relevant experiences or projects</li>
                    <li>Keep it concise but detailed (200-400 words)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Questions */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                
                {/* LinkedIn/Portfolio Links */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={customAnswers.linkedin || ''}
                      onChange={(e) =>
                        setCustomAnswers({ ...customAnswers, linkedin: e.target.value })
                      }
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio/GitHub (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={customAnswers.portfolio || ''}
                      onChange={(e) =>
                        setCustomAnswers({ ...customAnswers, portfolio: e.target.value })
                      }
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want to work at {companyName}?
                    </label>
                    <textarea
                      value={customAnswers.whyCompany || ''}
                      onChange={(e) =>
                        setCustomAnswers({ ...customAnswers, whyCompany: e.target.value })
                      }
                      placeholder="Share what excites you about this opportunity..."
                      className="input-field w-full h-32 resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="start-date-select" className="block text-sm font-medium text-gray-700 mb-2">
                      When can you start?
                    </label>
                    <select
                      id="start-date-select"
                      value={customAnswers.startDate || ''}
                      onChange={(e) =>
                        setCustomAnswers({ ...customAnswers, startDate: e.target.value })
                      }
                      className="input-field w-full"
                    >
                      <option value="">Select availability</option>
                      <option value="immediately">Immediately</option>
                      <option value="2weeks">2 Weeks Notice</option>
                      <option value="1month">1 Month</option>
                      <option value="2months">2 Months</option>
                      <option value="afterGraduation">After Graduation</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit / Success */}
          {step === 4 && (
            <div className="text-center py-8">
              {submitting ? (
                <div className="space-y-4">
                  <Loader className="w-16 h-16 text-primary-600 animate-spin mx-auto" />
                  <p className="text-lg font-semibold text-gray-900">Submitting your application...</p>
                </div>
              ) : (
                <div className="space-y-4 animate-scale-in">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Application Submitted!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your application for <span className="font-semibold">{job.title}</span> at{' '}
                    <span className="font-semibold">{companyName}</span> has been successfully submitted.
                  </p>
                  <div className="p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-blue-800">
                      💼 We'll notify you when the employer reviews your application.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
            <button
              onClick={() => {
                if (step === 1) {
                  onClose();
                } else {
                  setStep(step - 1);
                }
              }}
              disabled={submitting}
              className="btn-secondary"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                Save as Draft
              </button>
              <button
                onClick={() => {
                  if (step === 3) {
                    handleSubmit();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={
                  submitting ||
                  (step === 1 && !resumeFile) ||
                  (step === 2 && coverLetter.length < 50)
                }
                className="btn-primary"
              >
                {step === 3 ? (
                  submitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationForm;
