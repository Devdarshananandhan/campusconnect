import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Briefcase,
  Users,
  TrendingUp,
  Search,
  Filter,
  MessageSquare,
  Building2,
  GraduationCap,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Send,
} from 'lucide-react';
import { Job, Referral, User } from '../../types';
import api from '../../services/api';

interface ReferralMarketplaceProps {
  currentUser: any;
  onJobClick: (jobId: string) => void;
}

const ReferralMarketplace: React.FC<ReferralMarketplaceProps> = ({
  currentUser,
  onJobClick,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedAlumnus, setSelectedAlumnus] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [relationship, setRelationship] = useState<string>('classmate');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const jobsData = await api.getJobs({});
      setJobs(jobsData.jobs || jobsData);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReferral = async (job: Job, alumnus: any) => {
    setSelectedJob(job);
    setSelectedAlumnus(alumnus);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedJob || !requestMessage.trim()) {
      alert('Please write a message');
      return;
    }

    setSubmitting(true);
    try {
      await api.requestReferral({
        job: selectedJob.id,
        alumnus: selectedAlumnus?.id || '',
        message: requestMessage,
        relationship: relationship as any,
      });
      alert('Referral request sent successfully!');
      setShowRequestModal(false);
      setRequestMessage('');
      setSelectedJob(null);
    } catch (error) {
      console.error('Failed to request referral:', error);
      alert('Failed to send referral request');
    } finally {
      setSubmitting(false);
    }
  };

  const getAlumniForJob = (job: Job) => {
    // Get company alumni
    const company = typeof job.company === 'object' ? job.company : null;
    return company?.alumniEmployees || [];
  };

  const filteredJobs = jobs.filter((job) => {
    const company = typeof job.company === 'object' ? job.company : null;
    const alumni = getAlumniForJob(job);
    
    // Only show jobs where alumni work
    if (alumni.length === 0) return false;

    // Search filter
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company?.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-gradient p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display gradient-text">
              Referral Marketplace
            </h1>
            <p className="text-gray-600 text-lg">
              Connect with alumni to get referrals at top companies
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50">
            <div className="text-3xl font-bold text-primary-600">{filteredJobs.length}</div>
            <div className="text-sm text-gray-600">Jobs with Alumni</div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-3">
            <GraduationCap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How Referrals Work</h3>
              <p className="text-sm text-blue-800">
                Request referrals from alumni working at your dream companies. Alumni can review
                your profile and decide to refer you, significantly boosting your application!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 w-full"
          />
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs with alumni found</h3>
          <p className="text-gray-600">Try adjusting your search or check back later</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => {
            const company = typeof job.company === 'object' ? job.company : null;
            const alumni = getAlumniForJob(job);

            return (
              <div key={job.id} className="card p-6 hover:shadow-xl transition-all">
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-16 h-16 rounded-lg object-contain bg-gray-50 border p-2"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3
                        onClick={() => onJobClick(job.id)}
                        className="text-xl font-bold text-gray-900 mb-1 hover:text-primary-600 cursor-pointer transition-colors"
                      >
                        {job.title}
                      </h3>
                      <p className="text-gray-700 mb-2">{company?.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {job.type}
                        </span>
                        <span>{job.location}</span>
                        {job.salary && (
                          <span className="text-green-600 font-semibold">
                            {job.salary.currency}
                            {job.salary.min / 1000}k - {job.salary.max / 1000}k
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alumni Section */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold text-primary-900">
                        {alumni.length} {alumni.length === 1 ? 'Alumnus' : 'Alumni'} can refer you
                      </span>
                    </div>
                  </div>

                  {/* Alumni List */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {alumni.slice(0, 4).map((alum: any, index: number) => {
                      const alumUser = typeof alum === 'object' ? alum : null;
                      return (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 flex items-center space-x-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 font-semibold">
                              {alumUser?.profile?.name?.[0] || 'A'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {alumUser?.profile?.name || 'Alumni'}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {alumUser?.role || 'Employee'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleRequestReferral(job, alumni[0])}
                    className="btn-primary w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Request Referral
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Referral Modal */}
      {showRequestModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">Request Referral</h2>
              <p className="text-gray-600 mt-1">
                {selectedJob.title} at{' '}
                {typeof selectedJob.company === 'object' ? selectedJob.company.name : ''}
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="relationship-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Your relationship with the alumnus
                </label>
                <select
                  id="relationship-select"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="input w-full"
                >
                  <option value="classmate">Classmate</option>
                  <option value="club-member">Club Member</option>
                  <option value="project-partner">Project Partner</option>
                  <option value="mentor-mentee">Mentor/Mentee</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="referral-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Alumni *
                </label>
                <textarea
                  id="referral-message"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you're interested in this role..."
                  className="input w-full h-40 resize-none"
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500 mt-1">{requestMessage.length}/1000 characters</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Tips for a great request</h4>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Personalize your message - mention shared connections or experiences</li>
                  <li>Explain why you're interested in the company and role</li>
                  <li>Highlight relevant skills and experiences</li>
                  <li>Keep it concise and professional</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-between">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestMessage('');
                  setSelectedJob(null);
                }}
                disabled={submitting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={submitting || !requestMessage.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralMarketplace;
