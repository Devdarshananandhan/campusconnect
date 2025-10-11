import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Filter,
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  TrendingUp,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { Application } from '../../types';
import api from '../../services/api';
import ApplicationStatusTracker from './ApplicationStatusTracker';

interface MyApplicationsPageProps {
  currentUser: any;
}

const MyApplicationsPage: React.FC<MyApplicationsPageProps> = ({ currentUser }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await api.getMyApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await api.withdrawApplication(applicationId);
      setApplications(applications.filter((app) => app.id !== applicationId));
      alert('Application withdrawn successfully');
    } catch (error) {
      console.error('Failed to withdraw application:', error);
      alert('Failed to withdraw application');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { bg: string; text: string; icon: React.ReactNode }
    > = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock className="w-4 h-4" />,
      },
      reviewed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Eye className="w-4 h-4" />,
      },
      shortlisted: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      interviewing: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        icon: <MessageSquare className="w-4 h-4" />,
      },
      offered: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle className="w-4 h-4" />,
      },
      withdrawn: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const badge = badges[status] || badges.pending;

    return (
      <span
        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}
      >
        {badge.icon}
        <span className="capitalize">{status}</span>
      </span>
    );
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

  const statusFilters = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offered', label: 'Offers' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const filteredApplications =
    selectedStatus === 'all'
      ? applications
      : applications.filter((app) => app.status === selectedStatus);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    interviewing: applications.filter((a) => a.status === 'interviewing').length,
    offered: applications.filter((a) => a.status === 'offered').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  if (showDetails && selectedApplication) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <button
          onClick={() => {
            setShowDetails(false);
            setSelectedApplication(null);
          }}
          className="btn-secondary"
        >
          ← Back to Applications
        </button>

        <ApplicationStatusTracker
          application={selectedApplication}
          onWithdraw={handleWithdraw}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-gradient p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display gradient-text">
              My Applications
            </h1>
            <p className="text-gray-600 text-lg">
              Track and manage your job applications
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-3xl font-bold text-indigo-600">{stats.interviewing}</div>
            <div className="text-sm text-gray-600">Interviewing</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-3xl font-bold text-green-600">{stats.offered}</div>
            <div className="text-sm text-gray-600">Offers</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter by Status</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedStatus === filter.value
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-600">
            {selectedStatus === 'all'
              ? "You haven't applied to any jobs yet"
              : `No ${selectedStatus} applications`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((application) => {
            const job = typeof application.job === 'object' ? application.job : null;
            const jobTitle = job?.title || 'Unknown Position';
            const company =
              job && typeof job.company === 'object' && job.company !== null
                ? job.company
                : null;
            const companyName = company?.name || 'Unknown Company';
            const companyLogo = company?.logo;

            return (
              <div
                key={application.id}
                className="card p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => {
                  setSelectedApplication(application);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Company Logo */}
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="w-12 h-12 rounded-lg object-contain bg-gray-50 border p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary-600" />
                      </div>
                    )}

                    {/* Job Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{jobTitle}</h3>
                      <p className="text-gray-700 mb-2">{companyName}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
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

                      {/* Status History */}
                      {application.statusHistory && application.statusHistory.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600">
                          Last updated {getTimeAgo(application.updatedAt)}
                        </div>
                      )}

                      {/* Employer Notes */}
                      {application.employerNotes && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start">
                            <MessageSquare className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">Employer Note:</p>
                              <p className="text-sm text-blue-800 mt-1">
                                {application.employerNotes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="ml-4">{getStatusBadge(application.status)}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(application);
                      setShowDetails(true);
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>

                  {application.status === 'pending' || application.status === 'reviewed' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWithdraw(application.id);
                      }}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Withdraw
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
