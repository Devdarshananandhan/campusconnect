import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, TrendingUp } from 'lucide-react';
import { Group } from '../../types';
import { GroupList } from '../groups/GroupList';
import CreateGroupModal from '../groups/CreateGroupModal';
import GroupDetailPage from '../groups/GroupDetailPage';
import api from '../../services/api';

interface GroupsPageProps {
  currentUser: any;
  onMessageUser?: (userId: string) => void;
}

const GroupsPage: React.FC<GroupsPageProps> = ({ currentUser, onMessageUser }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPrivacy, setFilterPrivacy] = useState<string>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, [filterType, filterPrivacy]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterType !== 'all') filters.type = filterType;
      if (filterPrivacy !== 'all') filters.privacy = filterPrivacy;
      
      const data = await api.getGroups(filters);
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData: Partial<Group>) => {
    try {
      const newGroup = await api.createGroup(groupData);
      setGroups([newGroup, ...groups]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const updatedGroup = await api.joinGroup(groupId);
      setGroups(groups.map((g) => (g.id === groupId ? updatedGroup : g)));
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleViewGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleBackToList = () => {
    setSelectedGroupId(null);
    loadGroups(); // Refresh the groups list
  };

  const handleMessageUser = (userId: string) => {
    if (onMessageUser) {
      onMessageUser(userId);
    }
  };

  // Show group detail page if a group is selected
  if (selectedGroupId) {
    return (
      <GroupDetailPage
        groupId={selectedGroupId}
        currentUser={currentUser}
        onBack={handleBackToList}
        onMessageUser={handleMessageUser}
      />
    );
  }

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'major', label: 'Major' },
    { value: 'club', label: 'Club' },
    { value: 'research', label: 'Research' },
    { value: 'career', label: 'Career' },
    { value: 'project', label: 'Project' },
  ];

  const privacyOptions = [
    { value: 'all', label: 'All' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
  ];

  const trendingGroups = filteredGroups
    .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-gradient p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display gradient-text">
              Groups & Communities
            </h1>
            <p className="text-gray-600 text-lg">
              Connect with peers, collaborate on projects, and grow together
            </p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary shadow-glow">
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-3xl font-bold text-primary-600">{groups.length}</div>
            <div className="text-sm text-gray-600">Total Groups</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-3xl font-bold text-secondary-600">
              {groups.filter((g) => g.members?.some((m) => {
                const userId = typeof m.user === 'string' ? m.user : (m.user as any)?._id || (m.user as any)?.id;
                return userId === currentUser.id;
              })).length}
            </div>
            <div className="text-sm text-gray-600">Your Groups</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-3xl font-bold text-accent-600">
              {groups.filter((g) => g.privacy === 'public').length}
            </div>
            <div className="text-sm text-gray-600">Public Groups</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-1">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field pl-12"
                aria-label="Filter groups by type"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Privacy Filter */}
          <div className="md:col-span-1">
            <select
              value={filterPrivacy}
              onChange={(e) => setFilterPrivacy(e.target.value)}
              className="input-field"
              aria-label="Filter groups by privacy level"
            >
              {privacyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trending Groups */}
      {trendingGroups.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900 font-display">Trending Groups</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingGroups.map((group) => (
              <div
                key={group.id}
                className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all cursor-pointer"
                onClick={() => handleViewGroup(group.id)}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{group.description}</p>
                <div className="text-xs text-orange-600 font-semibold">
                  🔥 {group.members?.length || 0} members
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups List */}
      <GroupList
        groups={filteredGroups}
        currentUserId={currentUser.id}
        onJoinGroup={handleJoinGroup}
        onViewGroup={handleViewGroup}
        loading={loading}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
};

export default GroupsPage;
