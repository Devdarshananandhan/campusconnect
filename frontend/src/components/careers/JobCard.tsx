import React from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Bookmark,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { Job } from '../../types';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onSave?: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick, onSave }) => {
  const getJobTypeBadge = (type: string) => {
    const badges: { [key: string]: string } = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-green-100 text-green-800',
      internship: 'bg-purple-100 text-purple-800',
      contract: 'bg-orange-100 text-orange-800',
      remote: 'bg-indigo-100 text-indigo-800',
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceBadge = (level: string) => {
    const badges: { [key: string]: string } = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior Level',
      lead: 'Lead/Principal',
    };
    return badges[level] || level;
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

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const companyName =
    typeof job.company === 'object' && job.company !== null
      ? job.company.name
      : 'Company Name';

  const companyLogo =
    typeof job.company === 'object' && job.company !== null && job.company.logo
      ? job.company.logo
      : null;

  return (
    <div
      className="card hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Featured Badge */}
      {job.featured && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            ⭐ Featured
          </span>
        </div>
      )}

      {/* Company Header */}
      <div className="h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-t-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        {companyLogo ? (
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-lg">
            <img src={companyLogo} alt={companyName} className="h-12 w-12 object-contain" />
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
            <Building2 className="h-10 w-10 text-primary-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pt-4">
        {/* Job Type & Experience Level */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getJobTypeBadge(job.type)}`}>
            {job.type.toUpperCase()}
          </span>
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {getExperienceBadge(job.experienceLevel)}
          </span>
        </div>

        {/* Job Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {job.title}
        </h3>

        {/* Company Name */}
        <p className="text-gray-700 font-medium mb-3 flex items-center">
          <Building2 className="w-4 h-4 mr-2 text-gray-500" />
          {companyName}
        </p>

        {/* Location & Salary */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{job.location}</span>
          </div>
          {job.salary && (
            <div className="flex items-center text-gray-600 text-sm font-semibold">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-green-700">{formatSalary(job.salary)}</span>
            </div>
          )}
        </div>

        {/* Skills (Top 3) */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-gray-500">+{job.skills.length - 3} more</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>{getTimeAgo(job.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {job.applicationDeadline && (
              <div className="text-xs text-gray-600 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave?.(job.id);
          }}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110"
          aria-label="Save job"
        >
          <Bookmark className="w-4 h-4 text-gray-600" />
        </button>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>{job.applicantCount || 0} applicants</span>
          <span>{job.views || 0} views</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
