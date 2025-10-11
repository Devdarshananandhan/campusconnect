import React, { useState, useEffect } from 'react';
import {
  Send,
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Building2,
  MessageSquare,
  TrendingUp,
  Award,
  FileText,
} from 'lucide-react';
import { Referral } from '../../types';
import api from '../../services/api';

interface ReferralDashboardProps {
  currentUser: any;
  onJobClick: (jobId: string) => void;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ currentUser, onJobClick }) => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedReferrals, setReceivedReferrals] = useState<Referral[]>([]);
  const [sentReferrals, setSentReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [endorsement, setEndorsement] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReferrals();
    loadStats();
  }, []);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const [received, sent] = await Promise.all([
        api.getReceivedReferrals(),
        api.getSentReferrals(),
      ]);
      setReceivedReferrals(received);
      setSentReferrals(sent);
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await api.getReferralStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleApprove = async (referralId: string) => {
    if (!endorsement.trim()) {
      alert('Please write an endorsement');
      return;
    }

    setActionLoading(true);
    try {
      await api.approveReferral(referralId, endorsement);
      await loadReferrals();
      await loadStats();
      setShowDetailModal(false);
      setEndorsement('');
      alert('Referral approved successfully!');
    } catch (error) {
      console.error('Failed to approve referral:', error);
      alert('Failed to approve referral');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (referralId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason');
      return;
    }

    setActionLoading(true);
    try {
      await api.rejectReferral(referralId, rejectionReason);
      await loadReferrals();
      await loadStats();
      setShowDetailModal(false);
      setRejectionReason('');
      alert('Referral rejected');
    } catch (error) {
      console.error('Failed to reject referral:', error);
      alert('Failed to reject referral');
    } finally {
      setActionLoading(false);
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
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle className="w-4 h-4" />,
      },
      used: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Award className="w-4 h-4" />,
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

  const ReferralCard: React.FC<{ referral: Referral; type: 'received' | 'sent' }> = ({
    referral,
    type,
  }) => {
    const job = typeof referral.job === 'object' ? referral.job : null;
    const student = typeof referral.student === 'object' ? referral.student : null;
    const alumnus = typeof referral.alumnus === 'object' ? referral.alumnus : null;
    const company = job && typeof job.company === 'object' ? job.company : null;

    const otherUser = type === 'received' ? student : alumnus;

    return (
      <div
        className="card p-6 hover:shadow-xl transition-all cursor-pointer"
        onClick={() => {
          setSelectedReferral(referral);
          setShowDetailModal(true);
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* User Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-semibold text-lg">
                {otherUser?.profile?.name?.[0] || 'U'}
              </span>
            </div>

            {/* Referral Info */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {type === 'received' ? 'Referral Request from' : 'Referral Request to'}{' '}
                {otherUser?.profile?.name || 'User'}
              </h3>
              <p className="text-gray-700 mb-2">
                {job?.title} at {company?.name}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {getTimeAgo(referral.createdAt)}
                </span>
                <span className="capitalize">{referral.relationship}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {getStatusBadge(referral.status)}
        </div>

        {/* Message Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 line-clamp-2">{referral.message}</p>
        </div>

        {/* Action Buttons */}
        {type === 'received' && referral.status === 'pending' && (
          <div className="flex space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReferral(referral);
                setShowDetailModal(true);
              }}
              className="btn-primary flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Review
            </button>
          </div>
        )}

        {/* Endorsement/Rejection Display */}
        {referral.status === 'approved' && referral.endorsement && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-start space-x-2">
              <Award className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Endorsement:</p>
                <p className="text-sm text-green-800 mt-1">{referral.endorsement}</p>
              </div>
            </div>
          </div>
        )}

        {referral.status === 'rejected' && referral.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <div className="flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Reason:</p>
                <p className="text-sm text-red-800 mt-1">{referral.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header with Stats */}
      <div className="card-gradient p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 font-display gradient-text">
          Referral Dashboard
        </h1>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <div className="text-3xl font-bold text-blue-600">{stats.totalReceived || 0}</div>
              <div className="text-sm text-gray-600">Requests Received</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <div className="text-3xl font-bold text-green-600">{stats.totalApproved || 0}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <div className="text-3xl font-bold text-yellow-600">{stats.totalSent || 0}</div>
              <div className="text-sm text-gray-600">Sent</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <div className="text-3xl font-bold text-purple-600">{stats.successRate || 0}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="card p-6">
        <div className="flex space-x-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'received'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox className="w-5 h-5" />
            <span>Received ({receivedReferrals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'sent'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>Sent ({sentReferrals.length})</span>
          </button>
        </div>
      </div>

      {/* Referrals List */}
      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {activeTab === 'received' ? (
            receivedReferrals.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No referral requests yet
                </h3>
                <p className="text-gray-600">
                  You'll see requests from students seeking your referral here
                </p>
              </div>
            ) : (
              receivedReferrals.map((referral) => (
                <ReferralCard key={referral.id} referral={referral} type="received" />
              ))
            )
          ) : sentReferrals.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests sent</h3>
              <p className="text-gray-600">
                Visit the Referral Marketplace to request referrals from alumni
              </p>
            </div>
          ) : (
            sentReferrals.map((referral) => (
              <ReferralCard key={referral.id} referral={referral} type="sent" />
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReferral && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Referral Request Details</h2>
                  {getStatusBadge(selectedReferral.status)}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Position</h3>
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {typeof selectedReferral.job === 'object'
                        ? selectedReferral.job.title
                        : 'Job'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {typeof selectedReferral.job === 'object' &&
                      typeof selectedReferral.job.company === 'object'
                        ? selectedReferral.job.company.name
                        : 'Company'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student/Alumnus Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {activeTab === 'received' ? 'Student' : 'Alumnus'}
                </h3>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {activeTab === 'received'
                        ? typeof selectedReferral.student === 'object'
                          ? selectedReferral.student.profile?.name
                          : 'Student'
                        : typeof selectedReferral.alumnus === 'object'
                        ? selectedReferral.alumnus.profile?.name
                        : 'Alumnus'}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      Relationship: {selectedReferral.relationship}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">{selectedReferral.message}</p>
                </div>
              </div>

              {/* Actions for Pending Received Referrals */}
              {activeTab === 'received' && selectedReferral.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label htmlFor="endorsement-text" className="block text-sm font-medium text-gray-700 mb-2">
                      Write your endorsement *
                    </label>
                    <textarea
                      id="endorsement-text"
                      value={endorsement}
                      onChange={(e) => setEndorsement(e.target.value)}
                      placeholder="Write a brief endorsement highlighting the student's strengths..."
                      className="input w-full h-32 resize-none"
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">{endorsement.length}/500</p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedReferral.id)}
                      disabled={actionLoading || !endorsement.trim()}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Refer
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          setRejectionReason(reason);
                          handleReject(selectedReferral.id);
                        }
                      }}
                      disabled={actionLoading}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralDashboard;
