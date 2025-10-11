import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Building2,
  Calendar,
} from 'lucide-react';
import { Job } from '../../types';
import api from '../../services/api';

interface PostJobFormProps {
  currentUser: any;
  jobToEdit?: Job | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PostJobForm: React.FC<PostJobFormProps> = ({
  currentUser,
  jobToEdit,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryMin: '',
    salaryMax: '',
    isRemote: false,
    description: '',
    responsibilities: [''],
    requirements: [''],
    skills: [''],
    benefits: [''],
    applicationDeadline: '',
    applyUrl: '',
    status: 'active',
  });

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || '',
        company: typeof jobToEdit.company === 'string' 
          ? jobToEdit.company 
          : (jobToEdit.company?.name || ''),
        location: jobToEdit.location || '',
        type: jobToEdit.type || 'Full-time',
        experienceLevel: jobToEdit.experienceLevel || 'Entry Level',
        salaryMin: jobToEdit.salaryMin?.toString() || '',
        salaryMax: jobToEdit.salaryMax?.toString() || '',
        isRemote: jobToEdit.isRemote || false,
        description: jobToEdit.description || '',
        responsibilities: jobToEdit.responsibilities || [''],
        requirements: jobToEdit.requirements || [''],
        skills: jobToEdit.skills || [''],
        benefits: jobToEdit.benefits || [''],
        applicationDeadline: jobToEdit.applicationDeadline 
          ? new Date(jobToEdit.applicationDeadline).toISOString().split('T')[0]
          : '',
        applyUrl: jobToEdit.applyUrl || '',
        status: jobToEdit.status || 'active',
      });
    }
  }, [jobToEdit]);

  const handleArrayFieldChange = (
    field: 'responsibilities' | 'requirements' | 'skills' | 'benefits',
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const handleAddArrayField = (
    field: 'responsibilities' | 'requirements' | 'skills' | 'benefits'
  ) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const handleRemoveArrayField = (
    field: 'responsibilities' | 'requirements' | 'skills' | 'benefits',
    index: number
  ) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated });
  };

  // Silent validation for button disabled state (no alerts)
  const isStepValid = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.title?.trim() && formData.company?.trim() && formData.location?.trim() && formData.type);
      case 2:
        return !!(formData.description?.trim() && formData.responsibilities.some(r => r.trim()));
      case 3:
        return !!(formData.requirements.some(r => r.trim()) && formData.skills.some(s => s.trim()));
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Validation with user feedback (shows alerts)
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.title || !formData.title.trim()) {
          alert('Please enter a job title');
          return false;
        }
        if (!formData.company || !formData.company.trim()) {
          alert('Please enter a company name');
          return false;
        }
        if (!formData.location || !formData.location.trim()) {
          alert('Please enter a location');
          return false;
        }
        if (!formData.type) {
          alert('Please select a job type');
          return false;
        }
        return true;
      case 2:
        if (!formData.description || !formData.description.trim()) {
          alert('Please enter a job description');
          return false;
        }
        if (!formData.responsibilities.some(r => r.trim())) {
          alert('Please add at least one responsibility');
          return false;
        }
        return true;
      case 3:
        if (!formData.requirements.some(r => r.trim())) {
          alert('Please add at least one requirement');
          return false;
        }
        if (!formData.skills.some(s => s.trim())) {
          alert('Please add at least one required skill');
          return false;
        }
        return true;
      case 4:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convert form values to backend enum format
      const convertType = (type: string): string => {
        const typeMap: Record<string, string> = {
          'Full-time': 'full-time',
          'Part-time': 'part-time',
          'Internship': 'internship',
          'Contract': 'contract',
        };
        return typeMap[type] || type.toLowerCase();
      };

      const convertExperienceLevel = (level: string): string => {
        const levelMap: Record<string, string> = {
          'Entry Level': 'entry',
          'Mid Level': 'mid',
          'Senior': 'senior',
          'Executive': 'executive',
        };
        return levelMap[level] || level.toLowerCase();
      };

      const jobData = {
        ...formData,
        type: convertType(formData.type),
        experienceLevel: convertExperienceLevel(formData.experienceLevel),
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        skills: formData.skills.filter(s => s.trim()),
        benefits: formData.benefits.filter(b => b.trim()),
        applicationDeadline: formData.applicationDeadline || undefined,
      };

      if (jobToEdit) {
        await api.updateJob(jobToEdit.id, jobData);
      } else {
        await api.createJob(jobData);
      }

      alert(jobToEdit ? 'Job updated successfully!' : 'Job posted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save job:', error);
      alert('Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {jobToEdit ? 'Edit Job Posting' : 'Post a New Job'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    s < step
                      ? 'bg-white text-primary-600'
                      : s === step
                      ? 'bg-white text-primary-600'
                      : 'bg-white/30 text-white'
                  }`}
                >
                  {s < step ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 flex-1 rounded ${
                      s < step ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step === 1 ? 'font-semibold' : 'opacity-75'}>Basic Info</span>
            <span className={step === 2 ? 'font-semibold' : 'opacity-75'}>Description</span>
            <span className={step === 3 ? 'font-semibold' : 'opacity-75'}>Requirements</span>
            <span className={step === 4 ? 'font-semibold' : 'opacity-75'}>Details</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google, Microsoft, Amazon"
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., San Francisco, CA"
                      className="input-field w-full pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field w-full"
                    title="Select job type"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="input-field w-full"
                    title="Select experience level"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="isRemote"
                    checked={formData.isRemote}
                    onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                    className="w-5 h-5 text-primary-600"
                    title="Remote position checkbox"
                  />
                  <label htmlFor="isRemote" className="text-sm font-medium text-gray-700">
                    Remote Position
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Min ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      placeholder="50000"
                      className="input-field w-full pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Max ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      placeholder="80000"
                      className="input-field w-full pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description & Responsibilities */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, team, and what makes this opportunity great..."
                  rows={6}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Responsibilities *
                </label>
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) =>
                        handleArrayFieldChange('responsibilities', index, e.target.value)
                      }
                      placeholder={`Responsibility ${index + 1}`}
                      className="input-field flex-1"
                    />
                    {formData.responsibilities.length > 1 && (
                      <button
                        onClick={() => handleRemoveArrayField('responsibilities', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Remove responsibility"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayField('responsibilities')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Responsibility</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Requirements & Skills */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) =>
                        handleArrayFieldChange('requirements', index, e.target.value)
                      }
                      placeholder={`Requirement ${index + 1}`}
                      className="input-field flex-1"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        onClick={() => handleRemoveArrayField('requirements', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Remove requirement"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayField('requirements')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Requirement</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills *
                </label>
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) =>
                        handleArrayFieldChange('skills', index, e.target.value)
                      }
                      placeholder={`Skill ${index + 1}`}
                      className="input-field flex-1"
                    />
                    {formData.skills.length > 1 && (
                      <button
                        onClick={() => handleRemoveArrayField('skills', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Remove skill"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayField('skills')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits
                </label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) =>
                        handleArrayFieldChange('benefits', index, e.target.value)
                      }
                      placeholder={`Benefit ${index + 1}`}
                      className="input-field flex-1"
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        onClick={() => handleRemoveArrayField('benefits', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Remove benefit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayField('benefits')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Benefit</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, applicationDeadline: e.target.value })
                    }
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Application URL
                </label>
                <input
                  type="url"
                  value={formData.applyUrl}
                  onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                  placeholder="https://company.com/careers/apply"
                  className="input-field w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use the built-in application system
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field w-full"
                  title="Select status"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="btn-primary"
                disabled={!isStepValid(step)}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : jobToEdit ? 'Update Job' : 'Post Job'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobForm;
