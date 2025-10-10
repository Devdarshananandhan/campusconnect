import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Calendar,
  Settings,
  Share2,
  UserPlus,
  LogOut,
  Shield,
  Lock,
  Globe,
  Send,
  MoreVertical,
  Pin,
  Trash2,
  Edit,
  Image as ImageIcon,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Group, Post, User } from '../../types';
import api from '../../services/api';

interface GroupDetailPageProps {
  groupId: string;
  currentUser: User;
  onBack: () => void;
  onMessageUser: (userId: string) => void;
}

const GroupDetailPage: React.FC<GroupDetailPageProps> = ({
  groupId,
  currentUser,
  onBack,
  onMessageUser
}) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'about'>('posts');
  const [newPostContent, setNewPostContent] = useState('');
  const [postingContent, setPostingContent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const [groupData, postsData, membersData] = await Promise.all([
        api.getGroupById(groupId),
        api.getGroupPosts(groupId),
        api.getGroupMembers(groupId)
      ]);
      setGroup(groupData);
      setPosts(postsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      setPostingContent(true);
      const newPost = await api.createGroupPost(groupId, newPostContent);
      setPosts([newPost, ...posts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setPostingContent(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await api.leaveGroup(groupId);
      onBack();
    } catch (error: any) {
      console.error('Failed to leave group:', error);
      alert(error.message || 'Failed to leave group');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.removeMember(groupId, userId);
      setMembers(members.filter(m => m.user._id !== userId));
      setShowMemberMenu(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    }
  };

  const handlePromoteMember = async (userId: string, role: string) => {
    try {
      await api.updateMemberRole(groupId, userId, role);
      await loadGroupData();
      setShowMemberMenu(null);
    } catch (error) {
      console.error('Failed to update member role:', error);
      alert('Failed to update member role');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await api.approveJoinRequest(groupId, requestId);
      await loadGroupData();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.rejectJoinRequest(groupId, requestId);
      await loadGroupData();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group not found</h2>
          <button onClick={onBack} className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isMember = group.members?.some(m => {
    const userId = typeof m.user === 'string' ? m.user : ((m.user as any)?._id || (m.user as any)?.id);
    return userId === currentUser.id;
  });
  const isAdmin = group.admins?.some(a => {
    const adminId = typeof a === 'string' ? a : ((a as any)?._id || (a as any)?.id);
    return adminId === currentUser.id;
  });
  const isCreator = (() => {
    const creatorId = typeof group.creator === 'string' ? group.creator : ((group.creator as any)?._id || (group.creator as any)?.id);
    return creatorId === currentUser.id;
  })();

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      major: 'from-blue-500 to-cyan-500',
      club: 'from-purple-500 to-pink-500',
      research: 'from-green-500 to-emerald-500',
      career: 'from-orange-500 to-red-500',
      project: 'from-indigo-500 to-purple-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Cover Image */}
      <div className={`h-64 bg-gradient-to-br ${getTypeColor(group.type)} relative`}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div className="flex items-center space-x-2">
            <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white transition-colors flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
            {(isAdmin || isCreator) && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Group Info */}
      <div className="max-w-6xl mx-auto px-4 -mt-20">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                {group.privacy === 'private' && <Lock className="w-5 h-5 text-gray-500" />}
                {group.privacy === 'public' && <Globe className="w-5 h-5 text-gray-500" />}
              </div>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{group.members?.length || 0} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{posts.length} posts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {isMember ? (
                <>
                  <button onClick={handleLeaveGroup} className="btn-outline-primary flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Group
                  </button>
                </>
              ) : (
                <button onClick={() => api.joinGroup(groupId).then(loadGroupData)} className="btn-primary flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Group
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag, index) => (
                <span key={index} className="badge">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Members ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {/* Create Post */}
                {isMember && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share something with the group..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <button className="text-gray-500 hover:text-gray-700" aria-label="Attach image">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || postingContent}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {postingContent ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Posts List */}
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600">Be the first to post in this group!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <img
                          src={(post.author as any)?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                          alt={(post.author as any)?.profile?.name || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {(post.author as any)?.profile?.name || 'User'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600" aria-label="Post options">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="mt-3 text-gray-800 whitespace-pre-wrap">{post.content}</p>
                          <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                            <button className="hover:text-primary-600">Like</button>
                            <button className="hover:text-primary-600">Comment</button>
                            <button className="hover:text-primary-600">Share</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                {/* Pending Requests (Admin only) */}
                {(isAdmin || isCreator) && group.pendingRequests && group.pendingRequests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h3>
                    <div className="space-y-3">
                      {group.pendingRequests.map((request: any) => (
                        <div key={request._id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={request.user?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                              alt={request.user?.profile?.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{request.user?.profile?.name}</p>
                              <p className="text-sm text-gray-600">{request.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request._id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member: any) => {
                    const memberUser = member.user;
                    const isCurrentUser = memberUser._id === currentUser.id;
                    const isMemberAdmin = member.role === 'admin';
                    const isMemberCreator = group.creator?.toString() === memberUser._id || (group.creator as any)?._id === memberUser._id;

                    return (
                      <div key={memberUser._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <img
                            src={memberUser.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={memberUser.profile?.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-gray-900">{memberUser.profile?.name}</p>
                              {isMemberCreator && <span title="Creator"><Shield className="w-4 h-4 text-yellow-500" /></span>}
                              {isMemberAdmin && !isMemberCreator && <span title="Admin"><Shield className="w-4 h-4 text-blue-500" /></span>}
                            </div>
                            <p className="text-sm text-gray-600">{memberUser.profile?.bio || memberUser.role}</p>
                            {memberUser.profile?.company && (
                              <p className="text-xs text-gray-500">{memberUser.profile.company}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!isCurrentUser && (
                            <button
                              onClick={() => onMessageUser(memberUser._id)}
                              className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200"
                              title="Message"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}
                          {(isAdmin || isCreator) && !isCurrentUser && !isMemberCreator && (
                            <div className="relative">
                              <button
                                onClick={() => setShowMemberMenu(showMemberMenu === memberUser._id ? null : memberUser._id)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                aria-label="Member options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {showMemberMenu === memberUser._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                  {!isMemberAdmin && (
                                    <button
                                      onClick={() => handlePromoteMember(memberUser._id, 'admin')}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                    >
                                      Promote to Admin
                                    </button>
                                  )}
                                  {isMemberAdmin && (
                                    <button
                                      onClick={() => handlePromoteMember(memberUser._id, 'member')}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                    >
                                      Demote to Member
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleRemoveMember(memberUser._id)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                  >
                                    Remove from Group
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About this group</h3>
                  <p className="text-gray-700">{group.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Type</h3>
                  <span className="badge capitalize">{group.type}</span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy</h3>
                  <div className="flex items-center space-x-2">
                    {group.privacy === 'private' ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    <span className="capitalize">{group.privacy}</span>
                  </div>
                </div>

                {group.rules && group.rules.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Rules</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {group.rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Created</h3>
                  <p className="text-gray-700">{new Date(group.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
