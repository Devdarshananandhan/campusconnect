import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MessageSquare,
  Download,
  ExternalLink,
  Filter,
  Search,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from 'lucide-react';
import { Application, Job } from '../../types';
import api from '../../services/api';

interface ApplicantTrackingSystemProps {
  jobId: string;
  onBack: () => void;
}

const ApplicantTrackingSystem: React.FC<ApplicantTrackingSystemProps> = ({
  jobId,
  onBack,
}) => {
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');

  // Helper function to safely get applicant data
  const getApplicant = (app: Application) => {
    return typeof app.applicant === 'string' ? null : app.applicant;
  };

  const statusStats = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed' || a.status === 'shortlisted').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offered: applications.filter(a => a.status === 'offered').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  useEffect(() => {
    loadData();
  }, [jobId]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobData, appsData] = await Promise.all([
        api.getJob(jobId),
        api.getApplications({ job: jobId }),
      ]);
      
      setJob(jobData);
      setApplications(appsData.applications || appsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(app => {
        const applicant = typeof app.applicant === 'string' ? null : app.applicant;
        return (
          applicant?.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(a => a.status === 'pending');
      } else if (statusFilter === 'reviewed') {
        filtered = filtered.filter(a => a.status === 'reviewed' || a.status === 'shortlisted');
      } else if (statusFilter === 'interviewing') {
        filtered = filtered.filter(a => a.status === 'interviewing');
      } else {
        filtered = filtered.filter(a => a.status === statusFilter);
      }
    }

    setFilteredApplications(filtered);
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await api.updateApplicationStatus(applicationId, newStatus);
      await loadData();
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus as any });
      }
      alert('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (applicationId: string) => {
    if (!note.trim()) {
      alert('Please write a note');
      return;
    }

    setActionLoading(true);
    try {
      await api.addApplicationNote(applicationId, note);
      await loadData();
      setNote('');
      alert('Note added successfully');
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; icon: any } } = {
      pending: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      reviewed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Eye },
      shortlisted: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Eye },
      interviewing: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: MessageSquare },
      offered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      withdrawn: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job?.title}</h1>
            <p className="text-gray-600 mt-1">
              {applications.length} total applications
            </p>
          </div>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(statusStats).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-4 rounded-xl border-2 transition-all ${
              statusFilter === status
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{count}</p>
            <p className="text-sm text-gray-600 capitalize mt-1">{status}</p>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Applications will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const applicant = getApplicant(application);
            return (
            <div
              key={application.id}
              className="bg-white rounded-xl shadow-soft hover:shadow-lg transition-all p-6 cursor-pointer"
              onClick={() => {
                setSelectedApplication(application);
                setShowDetailModal(true);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={applicant?.profile?.avatar || `https://ui-avatars.com/api/?name=${applicant?.profile?.name || 'User'}`}
                    alt={applicant?.profile?.name || 'Applicant'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {applicant?.profile?.name || 'Unknown Applicant'}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      {applicant?.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{applicant.email}</span>
                        </div>
                      )}
                      {application.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{application.phone}</span>
                        </div>
                      )}
                      {application.createdAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {application.coverLetter && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {application.coverLetter}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(application.status)}
                  {application.resumeUrl && (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Resume</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (() => {
        const applicant = getApplicant(selectedApplication);
        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={applicant?.profile?.avatar || `https://ui-avatars.com/api/?name=${applicant?.profile?.name || 'User'}`}
                    alt={applicant?.profile?.name || 'Applicant'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {applicant?.profile?.name || 'Unknown Applicant'}
                    </h2>
                    <p className="text-white/90">
                      {applicant?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Update */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['applied', 'screening', 'interview', 'offered', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedApplication.id, status)}
                      disabled={actionLoading}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                        selectedApplication.status === status
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Applied</p>
                    <p className="font-medium">
                      {new Date(selectedApplication.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedApplication.phone && (
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                  )}
                  {selectedApplication.linkedinUrl && (
                    <div>
                      <p className="text-gray-600">LinkedIn</p>
                      <a
                        href={selectedApplication.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {selectedApplication.portfolioUrl && (
                    <div>
                      <p className="text-gray-600">Portfolio</p>
                      <a
                        href={selectedApplication.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center space-x-1"
                      >
                        <span>View Portfolio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}

              {/* Custom Questions */}
              {selectedApplication.customAnswers && selectedApplication.customAnswers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Question Responses</h3>
                  <div className="space-y-3">
                    {selectedApplication.customAnswers.map((qa: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <p className="font-medium text-gray-900 mb-2">{qa.question}</p>
                        <p className="text-sm text-gray-700">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note about this candidate..."
                      rows={3}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => handleAddNote(selectedApplication.id)}
                      disabled={actionLoading || !note.trim()}
                      className="btn-primary h-fit"
                    >
                      Add
                    </button>
                  </div>

                  {selectedApplication.notes && selectedApplication.notes.length > 0 && (
                    <div className="space-y-2">
                      {selectedApplication.notes.map((noteItem: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-sm text-gray-900">
                              {noteItem.author?.profile?.name || 'Recruiter'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(noteItem.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700">{noteItem.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Resume */}
              {selectedApplication.resumeUrl && (
                <div>
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center space-x-2 w-full"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Resume</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default ApplicantTrackingSystem;
