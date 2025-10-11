import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Share2,
  Bookmark,
  Send,
  CheckCircle,
  Calendar,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import { Job, Company } from '../../types';
import api from '../../services/api';
import ApplicationForm from './ApplicationForm';

interface JobDetailPageProps {
  jobId: string;
  onBack: () => void;
  onApply?: (jobId: string) => void;
  onRequestReferral?: (jobId: string) => void;
  currentUser: any;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({
  jobId,
  onBack,
  onApply,
  onRequestReferral,
  currentUser,
}) => {
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    setLoading(true);
    try {
      const jobData = await api.getJobById(jobId);
      setJob(jobData);

      // Load company details if company is an ID
      if (typeof jobData.company === 'string') {
        const companyData = await api.getCompanyById(jobData.company);
        setCompany(companyData);
      } else {
        setCompany(jobData.company);
      }

      // Check if user has already applied
      // TODO: Implement this check with backend
      setHasApplied(false);
    } catch (error) {
      console.error('Failed to load job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    // TODO: Implement save job functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      await api.applyToJob(job!.id, applicationData);
      setHasApplied(true);
      setShowApplicationForm(false);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to submit application:', error);
      throw error;
    }
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}k`;
      }
      return num.toString();
    };
    return `${salary.currency}${formatNumber(salary.min)} - ${formatNumber(salary.max)}`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diffMs = new Date(deadline).getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="card p-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h3>
        <button onClick={onBack} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </button>
      </div>
    );
  }

  const daysUntilDeadline = job.applicationDeadline
    ? getDaysUntilDeadline(job.applicationDeadline)
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="btn-secondary">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button
            onClick={handleSave}
            className={`btn-secondary ${saved ? 'bg-primary-50 border-primary-500' : ''}`}
          >
            <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-current text-primary-600' : ''}`} />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header Card */}
          <div className="card p-8">
            {/* Job Title & Company */}
            <div className="flex items-start gap-4 mb-6">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-200 p-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary-600" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                  {job.title}
                </h1>
                <p className="text-xl text-gray-700 font-medium mb-2">{company?.name}</p>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {getTimeAgo(job.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {job.applicantCount || 0} applicants
                  </span>
                </div>
              </div>
            </div>

            {/* Job Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Job Type</div>
                <div className="font-semibold text-gray-900 capitalize">{job.type}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Experience</div>
                <div className="font-semibold text-gray-900 capitalize">
                  {job.experienceLevel} Level
                </div>
              </div>
              {job.salary && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Salary Range</div>
                  <div className="font-semibold text-green-700">{formatSalary(job.salary)}</div>
                </div>
              )}
              {job.department && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Department</div>
                  <div className="font-semibold text-gray-900">{job.department}</div>
                </div>
              )}
            </div>

            {/* Deadline Alert */}
            {daysUntilDeadline !== null && daysUntilDeadline <= 7 && (
              <div
                className={`p-4 rounded-lg border ${
                  daysUntilDeadline <= 3
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="font-semibold">
                    {daysUntilDeadline === 0
                      ? 'Application deadline is today!'
                      : daysUntilDeadline === 1
                      ? 'Application deadline is tomorrow!'
                      : `Only ${daysUntilDeadline} days left to apply!`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
              Job Description
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="badge bg-primary-100 text-primary-800 text-sm px-4 py-2"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                Benefits & Perks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {job.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <div className="card p-6 sticky top-6">
            <div className="space-y-4">
              {hasApplied ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">Already Applied</p>
                  <p className="text-sm text-green-600 mt-1">
                    We'll notify you about your application status
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="btn-primary w-full text-lg py-4"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Apply Now
                  </button>
                  <button
                    onClick={() => onRequestReferral?.(job.id)}
                    className="btn-secondary w-full"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Request Referral
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Company Info Card */}
          {company && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About the Company</h3>
              {company.logo && (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-24 object-contain mb-4 bg-gray-50 rounded-lg p-2"
                />
              )}
              <h4 className="font-semibold text-gray-900 mb-2">{company.name}</h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{company.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium text-gray-900">{company.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Size:</span>
                  <span className="font-medium text-gray-900 capitalize">{company.size}</span>
                </div>
                {company.foundedYear && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="font-medium text-gray-900">{company.foundedYear}</span>
                  </div>
                )}
                {company.alumniEmployees && company.alumniEmployees.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">XYZ Alumni:</span>
                    <span className="font-medium text-primary-600">
                      {company.alumniEmployees.length} employees
                    </span>
                  </div>
                )}
              </div>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full mt-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </a>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Job Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Views</span>
                <span className="font-semibold text-gray-900">{job.views || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Applicants</span>
                <span className="font-semibold text-gray-900">{job.applicantCount || 0}</span>
              </div>
              {job.applicationDeadline && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Deadline</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && job && (
        <ApplicationForm
          job={job}
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
          onSubmit={handleApplicationSubmit}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
