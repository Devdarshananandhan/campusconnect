import React from 'react';
import {
  Clock,
  Eye,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Application } from '../../types';

interface ApplicationStatusTrackerProps {
  application: Application;
  onWithdraw: (applicationId: string) => void;
}

const ApplicationStatusTracker: React.FC<ApplicationStatusTrackerProps> = ({
  application,
  onWithdraw,
}) => {
  const statusSteps = [
    { status: 'pending', label: 'Application Submitted', icon: Clock },
    { status: 'reviewed', label: 'Under Review', icon: Eye },
    { status: 'shortlisted', label: 'Shortlisted', icon: TrendingUp },
    { status: 'interviewing', label: 'Interviewing', icon: MessageSquare },
    { status: 'offered', label: 'Offer Extended', icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    if (application.status === 'rejected' || application.status === 'withdrawn') {
      return -1;
    }
    return statusSteps.findIndex((step) => step.status === application.status);
  };

  const currentStepIndex = getCurrentStepIndex();
  const isRejected = application.status === 'rejected';
  const isWithdrawn = application.status === 'withdrawn';

  const job = typeof application.job === 'object' ? application.job : null;
  const company =
    job && typeof job.company === 'object' && job.company !== null ? job.company : null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Job Header */}
      <div className="card-gradient p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-16 h-16 rounded-xl object-contain bg-white border p-2"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                {job?.title || 'Unknown Position'}
              </h1>
              <p className="text-xl text-gray-700 mb-2">{company?.name || 'Unknown Company'}</p>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Applied {getTimeAgo(application.appliedAt)}
                </span>
                {job?.location && (
                  <span className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {job && (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Job Posting</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
          Application Status
        </h2>

        {isRejected ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Application Not Selected</h3>
                <p className="text-red-800 mb-4">
                  Unfortunately, your application was not selected for this position.
                </p>
                {application.employerNotes && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-sm font-medium text-red-900 mb-1">Employer Feedback:</p>
                    <p className="text-sm text-red-800">{application.employerNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : isWithdrawn ? (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Withdrawn</h3>
                <p className="text-gray-700">You have withdrawn your application for this position.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div
              className={`absolute left-6 top-0 w-0.5 bg-primary-600 transition-all duration-500 ${
                currentStepIndex === 0
                  ? 'h-0'
                  : currentStepIndex === 1
                  ? 'h-1/4'
                  : currentStepIndex === 2
                  ? 'h-1/2'
                  : currentStepIndex === 3
                  ? 'h-3/4'
                  : 'h-full'
              }`}
            ></div>

            {/* Steps */}
            <div className="space-y-8 relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                const statusHistory = application.statusHistory?.find(
                  (h) => h.status === step.status
                );

                return (
                  <div key={step.status} className="relative flex items-start space-x-4">
                    {/* Step Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                        isCompleted
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-2">
                      <h3
                        className={`text-lg font-bold mb-1 ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </h3>
                      {statusHistory && (
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(statusHistory.changedAt)}
                        </p>
                      )}
                      {isCurrent && (
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-2">
                          <p className="text-sm text-primary-900 font-medium">Current Status</p>
                          <p className="text-sm text-primary-800 mt-1">
                            Your application is currently at this stage
                          </p>
                        </div>
                      )}
                      {statusHistory?.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Employer Notes:
                          </p>
                          <p className="text-sm text-blue-800">{statusHistory.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Application Details */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
          Application Materials
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resume */}
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Resume</h3>
                  <p className="text-sm text-gray-600">Submitted document</p>
                </div>
              </div>
              {application.resume && (
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                  title="Download Resume"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
            </div>
            {application.resume ? (
              <a
                href={application.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                View Resume →
              </a>
            ) : (
              <p className="text-sm text-gray-500">No resume attached</p>
            )}
          </div>

          {/* Cover Letter */}
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cover Letter</h3>
                  <p className="text-sm text-gray-600">
                    {application.coverLetter?.length || 0} characters
                  </p>
                </div>
              </div>
            </div>
            {application.coverLetter ? (
              <div className="max-h-32 overflow-y-auto text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                {application.coverLetter}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No cover letter submitted</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {(application.linkedinUrl ||
          application.portfolioUrl ||
          application.availableStartDate) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {application.linkedinUrl && (
                <a
                  href={application.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">LinkedIn Profile</span>
                </a>
              )}
              {application.portfolioUrl && (
                <a
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">Portfolio</span>
                </a>
              )}
              {application.availableStartDate && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Available:{' '}
                    {new Date(application.availableStartDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Answers */}
        {application.customAnswers && Object.keys(application.customAnswers).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Questions</h3>
            <div className="space-y-4">
              {Object.entries(application.customAnswers).map(([question, answer]) => (
                <div key={question} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">{question}</p>
                  <p className="text-sm text-gray-700">{answer as string}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isRejected && !isWithdrawn && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Application</h3>
              <p className="text-gray-600">
                No longer interested in this position? You can withdraw your application.
              </p>
            </div>
            <button
              onClick={() => onWithdraw(application.id)}
              className="btn-secondary text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Withdraw Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusTracker;
