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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header with Cover Image */}
      <div className={`h-48 md:h-64 bg-gradient-to-br ${getTypeColor(group.type)} relative`}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div className="flex items-center space-x-2">
            <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Share</span>
            </button>
            {(isAdmin || isCreator) && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Group Info */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="card-gradient p-6 md:p-8 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display">{group.name}</h1>
                <div className="flex items-center space-x-2">
                  {group.privacy === 'private' && (
                    <span className="flex items-center space-x-1 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </span>
                  )}
                  {group.privacy === 'public' && (
                    <span className="flex items-center space-x-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                    {group.type}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{group.description}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="p-1.5 bg-primary-100 rounded-lg">
                    <Users className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="font-medium">{group.members?.length || 0} members</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="p-1.5 bg-secondary-100 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-secondary-600" />
                  </div>
                  <span className="font-medium">{posts.length} posts</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="p-1.5 bg-accent-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-accent-600" />
                  </div>
                  <span className="font-medium">Created {new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 md:min-w-[160px]">
              {isMember ? (
                <>
                  {!isCreator && (
                    <button onClick={handleLeaveGroup} className="btn-outline-danger flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave Group
                    </button>
                  )}
                  {isCreator && (
                    <span className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 font-semibold px-4 py-2 rounded-xl">
                      <Shield className="w-5 h-5" />
                      <span>Creator</span>
                    </span>
                  )}
                </>
              ) : (
                <button onClick={() => api.joinGroup(groupId).then(loadGroupData)} className="btn-primary flex items-center justify-center shadow-glow">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Group
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/50">
              {group.tags.map((tag, index) => (
                <span key={index} className="badge-gradient">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="card shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Posts</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'members'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {members.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
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
                  <div className="card-gradient p-5 shadow-md animate-fade-in">
                    <div className="flex items-start space-x-3 mb-3">
                      <img
                        src={currentUser.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={currentUser.profile?.name}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Share something with the group...
                        </p>
                      </div>
                    </div>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all bg-white"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button 
                          className="text-gray-500 hover:text-primary-600 transition-colors p-2 hover:bg-primary-50 rounded-lg" 
                          aria-label="Attach image"
                          title="Attach image (coming soon)"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || postingContent}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                      >
                        {postingContent ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Posts List */}
                {posts.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mb-4">
                      <MessageCircle className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">No posts yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to share something with this group!</p>
                    {isMember && (
                      <button
                        onClick={() => setActiveTab('posts')}
                        className="btn-primary inline-flex items-center"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Create First Post
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="card hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <div className="flex items-start space-x-4">
                          <img
                            src={(post.author as any)?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={(post.author as any)?.profile?.name || 'User'}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-gray-900 hover:text-primary-600 transition-colors">
                                  {(post.author as any)?.profile?.name || 'User'}
                                </h4>
                                <p className="text-sm text-gray-500 flex items-center space-x-2">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                                </p>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors" aria-label="Post options">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                            <p className="mt-3 text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                            <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                <span className="hover:scale-110 transition-transform">👍</span>
                                <span className="font-medium">Like</span>
                              </button>
                              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-medium">Comment</span>
                              </button>
                              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span className="font-medium">Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-6 animate-fade-in">
                {/* Pending Requests (Admin only) */}
                {(isAdmin || isCreator) && group.pendingRequests && group.pendingRequests.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <UserPlus className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 font-display">Pending Join Requests</h3>
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                        {group.pendingRequests.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {group.pendingRequests.map((request: any) => (
                        <div key={request._id} className="card-gradient border-2 border-yellow-200 p-4 hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={request.user?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                alt={request.user?.profile?.name}
                                className="w-12 h-12 rounded-full border-2 border-yellow-300 shadow-md"
                              />
                              <div>
                                <p className="font-bold text-gray-900">{request.user?.profile?.name}</p>
                                {request.message && (
                                  <p className="text-sm text-gray-600 mt-1 italic">"{request.message}"</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Requested {new Date(request.requestedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleApproveRequest(request._id)}
                                className="flex items-center space-x-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request._id)}
                                className="flex items-center space-x-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 font-display">All Members</h3>
                      <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                        {members.length}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {members.map((member: any) => {
                      const memberUser = member.user;
                      const isCurrentUser = memberUser._id === currentUser.id;
                      const isMemberAdmin = member.role === 'admin';
                      const isMemberCreator = group.creator?.toString() === memberUser._id || (group.creator as any)?._id === memberUser._id;

                      return (
                        <div key={memberUser._id} className="card hover:shadow-xl transition-all duration-300 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={memberUser.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                  alt={memberUser.profile?.name}
                                  className="w-14 h-14 rounded-full border-2 border-white shadow-md"
                                />
                                {isMemberCreator && (
                                  <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-md" title="Creator">
                                    <Shield className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                {isMemberAdmin && !isMemberCreator && (
                                  <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-md" title="Admin">
                                    <Shield className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-bold text-gray-900 truncate">{memberUser.profile?.name}</p>
                                  {isCurrentUser && (
                                    <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 truncate">{memberUser.profile?.bio || memberUser.role}</p>
                                {memberUser.profile?.company && (
                                  <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                                    <span>🏢</span>
                                    <span className="truncate">{memberUser.profile.company}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              {!isCurrentUser && (
                                <button
                                  onClick={() => onMessageUser(memberUser._id)}
                                  className="p-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all shadow-md hover:shadow-lg group-hover:scale-105"
                                  title="Send Message"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                              )}
                              {(isAdmin || isCreator) && !isCurrentUser && !isMemberCreator && (
                                <div className="relative">
                                  <button
                                    onClick={() => setShowMemberMenu(showMemberMenu === memberUser._id ? null : memberUser._id)}
                                    className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Member options"
                                  >
                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                  </button>
                                  {showMemberMenu === memberUser._id && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-10 overflow-hidden">
                                      {!isMemberAdmin && (
                                        <button
                                          onClick={() => handlePromoteMember(memberUser._id, 'admin')}
                                          className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors"
                                        >
                                          <Shield className="w-4 h-4 text-blue-600" />
                                          <span>Promote to Admin</span>
                                        </button>
                                      )}
                                      {isMemberAdmin && (
                                        <button
                                          onClick={() => handlePromoteMember(memberUser._id, 'member')}
                                          className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors"
                                        >
                                          <Users className="w-4 h-4 text-gray-600" />
                                          <span>Demote to Member</span>
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleRemoveMember(memberUser._id)}
                                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-medium text-red-600 flex items-center space-x-2 transition-colors border-t border-gray-100"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Remove from Group</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6 animate-fade-in">
                <div className="card-gradient p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <span>About this group</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{group.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Group Type</h3>
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 font-bold px-4 py-2 rounded-xl">
                      <span className="capitalize">{group.type}</span>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Privacy</h3>
                    <div className="flex items-center space-x-3">
                      {group.privacy === 'private' ? (
                        <div className="flex items-center space-x-2 bg-purple-100 text-purple-700 font-bold px-4 py-2 rounded-xl">
                          <Lock className="w-4 h-4" />
                          <span className="capitalize">Private Group</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 bg-green-100 text-green-700 font-bold px-4 py-2 rounded-xl">
                          <Globe className="w-4 h-4" />
                          <span className="capitalize">Public Group</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {group.privacy === 'private' 
                        ? 'Only members can see group content' 
                        : 'Anyone can see group content'}
                    </p>
                  </div>
                </div>

                {group.rules && group.rules.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <div className="p-2 bg-accent-100 rounded-lg">
                        <Shield className="w-5 h-5 text-accent-600" />
                      </div>
                      <span>Group Rules</span>
                    </h3>
                    <ul className="space-y-3">
                      {group.rules.map((rule, index) => (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="card p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Created</h3>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(group.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {Math.floor((Date.now() - new Date(group.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Group Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                      <div className="text-3xl font-bold text-primary-600 mb-1">{group.members?.length || 0}</div>
                      <div className="text-sm text-gray-600 font-medium">Members</div>
                    </div>
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                      <div className="text-3xl font-bold text-secondary-600 mb-1">{posts.length}</div>
                      <div className="text-sm text-gray-600 font-medium">Posts</div>
                    </div>
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                      <div className="text-3xl font-bold text-accent-600 mb-1">
                        {group.admins?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Admins</div>
                    </div>
                  </div>
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
